import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createMakanan, updateMakanan, addMakananOptimistic, updateMakananOptimistic } from '@/store/makananSlice'
import type { Makanan, CreateMakanan, UpdateMakanan } from '@/types'

interface MakananFormProps {
  open: boolean
  onClose: () => void
  editingMakanan: Makanan | null
  categories: Array<{ value: string; label: string }>
}

export function MakananForm({ open, onClose, editingMakanan, categories }: MakananFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState<CreateMakanan>({
    nama: '',
    deskripsi: '',
    harga: 0,
    kategori: 'makanan',
    tersedia: true,
    stok: 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (editingMakanan) {
      setFormData({
        nama: editingMakanan.nama,
        deskripsi: editingMakanan.deskripsi || '',
        harga: editingMakanan.harga,
        kategori: editingMakanan.kategori,
        tersedia: editingMakanan.tersedia,
        stok: editingMakanan.stok,
      })
      if (editingMakanan.gambar) {
        // Use the full URL from API response
        setImagePreview(editingMakanan.gambar)
      }
    } else {
      resetForm()
    }
  }, [editingMakanan])

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      harga: 0,
      kategori: 'makanan',
      tersedia: true,
      stok: 0,
    })
    setImageFile(null)
    setImagePreview('')
    setValidationErrors({})
  }

  const handleInputChange = (field: keyof CreateMakanan, value: string | number | boolean) => {
    if (field === 'harga' || field === 'stok') {
      // Handle number input properly to avoid leading zeros
      const numValue = typeof value === 'string' ? value.replace(/^0+/, '') || '0' : String(value)
      const parsedValue = parseFloat(numValue) || 0
      setFormData(prev => ({ ...prev, [field]: parsedValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    
    if (!formData.nama.trim()) {
      toast.error('Nama makanan harus diisi')
      return
    }

    if (formData.harga <= 0) {
      toast.error('Harga harus lebih dari 0')
      return
    }

    // Close dialog immediately
    onClose()
    resetForm()

    // Show loading toast
    const toastId = toast.loading(editingMakanan ? 'Memperbarui makanan...' : 'Menambahkan makanan...')

    try {
      const submitData: CreateMakanan | UpdateMakanan = {
        ...formData,
      }

      // Only include gambar if it's a new file
      if (imageFile) {
        submitData.gambar = imageFile
      }

      if (editingMakanan) {
        // Optimistic update for edit
        const optimisticMakanan: Makanan = {
          ...editingMakanan,
          ...submitData,
          id: editingMakanan.id,
          created_at: editingMakanan.created_at,
          updated_at: new Date().toISOString(),
          gambar: imageFile ? editingMakanan.gambar : (submitData.gambar as string | undefined), // Keep existing image if no new file
        }
        dispatch(updateMakananOptimistic(optimisticMakanan))
        
        await dispatch(updateMakanan({ id: editingMakanan.id, data: submitData as UpdateMakanan })).unwrap()
        toast.success('Makanan berhasil diperbarui!', { id: toastId })
      } else {
        // Optimistic update for create
        const optimisticMakanan: Makanan = {
          id: Date.now(), // Temporary ID
          ...submitData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          gambar: undefined, // No image preview for new uploads until server responds
        } as Makanan
        
        dispatch(addMakananOptimistic(optimisticMakanan))
        
        await dispatch(createMakanan(submitData as CreateMakanan)).unwrap()
        toast.success('Makanan berhasil ditambahkan!', { id: toastId })
      }
    } catch (error: any) {
      console.error('Error saving makanan:', error)
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
        const firstError = Object.values(error.response.data.errors)[0] as string[]
        if (firstError && firstError[0]) {
          toast.error(firstError[0], { id: toastId })
        } else {
          toast.error('Gagal menyimpan makanan. Silakan coba lagi.', { id: toastId })
        }
      } else {
        toast.error('Gagal menyimpan makanan. Silakan coba lagi.', { id: toastId })
      }
      
      // Reopen form on error so user can fix it
      // Restore form data for retry
      setFormData({
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        harga: formData.harga,
        kategori: formData.kategori,
        tersedia: formData.tersedia,
        stok: formData.stok,
      })
      setImageFile(imageFile)
      onClose() // This will reopen the form with restored data
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMakanan ? 'Edit Makanan' : 'Tambah Makanan Baru'}
          </DialogTitle>
          <DialogDescription>
            {editingMakanan 
              ? 'Edit informasi makanan yang ada. Scroll ke bawah untuk melihat semua field.'
              : 'Tambah makanan baru ke menu. Scroll ke bawah untuk melihat semua field.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Makanan *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Masukkan nama makanan"
              required
              className={validationErrors.nama ? 'border-red-500' : ''}
            />
            {validationErrors.nama && (
              <p className="text-sm text-red-600">
                {validationErrors.nama[0]}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Masukkan deskripsi makanan"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Harga */}
            <div className="space-y-2">
              <Label htmlFor="harga">Harga *</Label>
              <Input
                id="harga"
                type="number"
                min="0"
                step="0.01"
                value={formData.harga === 0 ? '' : formData.harga}
                onChange={(e) => handleInputChange('harga', e.target.value)}
                placeholder="0"
                required
                className={validationErrors.harga ? 'border-red-500' : ''}
              />
              {validationErrors.harga && (
                <p className="text-sm text-red-600">
                  {validationErrors.harga[0]}
                </p>
              )}
            </div>

            {/* Stok */}
            <div className="space-y-2">
              <Label htmlFor="stok">Stok</Label>
              <Input
                id="stok"
                type="number"
                min="0"
                value={formData.stok === 0 ? '' : formData.stok}
                onChange={(e) => handleInputChange('stok', e.target.value)}
                placeholder="0"
                className={validationErrors.stok ? 'border-red-500' : ''}
              />
              {validationErrors.stok && (
                <p className="text-sm text-red-600">
                  {validationErrors.stok[0]}
                </p>
              )}
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select
              value={formData.kategori}
              onValueChange={(value) => handleInputChange('kategori', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gambar */}
          <div className="space-y-2">
            <Label htmlFor="gambar">Gambar</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="gambar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, GIF. Max: 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Tersedia */}
          <div className="flex items-center space-x-2">
            <Switch
              id="tersedia"
              checked={formData.tersedia}
              onCheckedChange={(checked) => handleInputChange('tersedia', checked)}
            />
            <Label htmlFor="tersedia">Tersedia untuk dijual</Label>
            {validationErrors.tersedia && (
              <p className="text-sm text-red-600 ml-2">
                {validationErrors.tersedia[0]}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
            >
              {editingMakanan ? 'Update' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
