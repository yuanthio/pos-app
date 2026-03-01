<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk Pesanan #{{ $pesanan->id }}</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0 auto;
            padding: 10px;
            width: 75mm; /* Sedikit lebih kecil dari 80mm untuk margin aman */
            color: #000;
        }
        
        .text-center {
            text-align: center;
        }
        
        .header {
            margin-bottom: 15px;
        }
        
        .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            display: block;
        }
        
        .restaurant-info {
            font-size: 10px;
        }
        
        .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
            width: 100%;
        }
        
        /* Mengganti Flexbox dengan Table untuk kompatibilitas PDF yang lebih simetris */
        .info-table, .calc-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-table td, .calc-table td {
            vertical-align: top;
            padding: 2px 0;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 5px 0;
        }
        
        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .total-row td {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
        }

        .footer {
            margin-top: 20px;
            font-size: 10px;
        }

        .thank-you {
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header text-center">
        <span class="restaurant-name">POS Restaurant</span>
        <div class="restaurant-info">
            Jl. Contoh No. 123<br>
            Tel: (021) 123-4567<br>
            info@posrestaurant.com
        </div>
    </div>

    <div class="divider"></div>

    <table class="info-table">
        <tr>
            <td width="40%">No. Pesanan</td>
            <td>: #{{ $pesanan->id }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ $date }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>: {{ $pesanan->user->name }}</td>
        </tr>
        <tr>
            <td>Meja</td>
            <td>: {{ $pesanan->meja->nomor_meja ?? 'Take Away' }}</td>
        </tr>
        @if($payment['customer_name'])
        <tr>
            <td>Pelanggan</td>
            <td>: {{ $payment['customer_name'] }}</td>
        </tr>
        @endif
    </table>

    <div class="divider"></div>

    <table class="items-table">
        <thead>
            <tr>
                <th width="50%">Item</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="40%" class="text-right">Harga</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pesanan->detailPesanans as $item)
            <tr>
                <td>{{ $item->makanan->nama ?? 'Unknown Item' }}</td>
                <td class="text-center">{{ $item->jumlah }}</td>
                <td class="text-right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <table class="calc-table">
        <tr>
            <td class="text-left">Subtotal</td>
            <td class="text-right">{{ number_format($payment['subtotal'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="text-left">Pajak ({{ $payment['tax_rate'] }}%)</td>
            <td class="text-right">{{ number_format($payment['tax'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="text-left">Service ({{ $payment['service_rate'] }}%)</td>
            <td class="text-right">{{ number_format($payment['service'], 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td class="text-left">TOTAL</td>
            <td class="text-right">{{ number_format($payment['total'], 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table class="calc-table">
        <tr>
            <td class="text-left">Metode Bayar</td>
            <td class="text-right">{{ ucfirst($payment['payment_method']) }}</td>
        </tr>
        <tr>
            <td class="text-left">Jumlah Bayar</td>
            <td class="text-right">{{ number_format($payment['payment_amount'], 0, ',', '.') }}</td>
        </tr>
        @if($payment['change'] > 0)
        <tr>
            <td class="text-left"><strong>Kembalian</strong></td>
            <td class="text-right"><strong>{{ number_format($payment['change'], 0, ',', '.') }}</strong></td>
        </tr>
        @endif
    </table>

    <div class="divider"></div>

    <div class="footer text-center">
        <div class="thank-you">TERIMA KASIH</div>
        <div>Silakan datang kembali</div>
        <div style="margin-top: 10px; font-size: 9px;">
            NPWP: {{ $restaurant['tax_id'] }}<br>
            Struk ini sah sebagai bukti pembayaran
        </div>
    </div>
</body>
</html>