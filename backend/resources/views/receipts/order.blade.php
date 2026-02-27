<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk Pesanan #{{ $pesanan->id }}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            width: 80mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .restaurant-info {
            font-size: 10px;
            margin-bottom: 10px;
        }
        
        .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        
        .order-info {
            margin-bottom: 15px;
        }
        
        .order-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            margin-bottom: 15px;
        }
        
        .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .items-table td {
            padding: 3px 0;
        }
        
        .item-name {
            font-weight: bold;
        }
        
        .item-quantity {
            text-align: center;
        }
        
        .item-price {
            text-align: right;
        }
        
        .calculations {
            margin-bottom: 15px;
        }
        
        .calc-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .total-row {
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 10px;
        }
        
        .payment-info {
            margin-bottom: 15px;
        }
        
        .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .change-row {
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
        }
        
        .thank-you {
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="restaurant-name">{{ $restaurant['name'] }}</div>
        <div class="restaurant-info">
            {{ $restaurant['address'] }}<br>
            Tel: {{ $restaurant['phone'] }}<br>
            {{ $restaurant['email'] }}
        </div>
    </div>

    <div class="divider"></div>

    <!-- Order Info -->
    <div class="order-info">
        <div class="order-info-row">
            <span>No. Pesanan:</span>
            <span>#{{ $pesanan->id }}</span>
        </div>
        <div class="order-info-row">
            <span>Tanggal:</span>
            <span>{{ $date }}</span>
        </div>
        <div class="order-info-row">
            <span>Kasir:</span>
            <span>{{ $pesanan->user->name }}</span>
        </div>
        <div class="order-info-row">
            <span>Meja:</span>
            <span>{{ $pesanan->meja->nomor_meja ?? 'Take Away' }}</span>
        </div>
        @if($payment['customer_name'])
        <div class="order-info-row">
            <span>Pelanggan:</span>
            <span>{{ $payment['customer_name'] }}</span>
        </div>
        @endif
    </div>

    <div class="divider"></div>

    <!-- Order Items -->
    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th class="item-quantity">Qty</th>
                <th class="item-price">Harga</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pesanan->detailPesanans as $item)
            <tr>
                <td class="item-name">{{ $item->makanan->nama_makanan }}</td>
                <td class="item-quantity">{{ $item->jumlah }}</td>
                <td class="item-price">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <!-- Calculations -->
    <div class="calculations">
        <div class="calc-row">
            <span>Subtotal:</span>
            <span>{{ number_format($payment['subtotal'], 0, ',', '.') }}</span>
        </div>
        <div class="calc-row">
            <span>Pajak ({{ $payment['tax_rate'] }}%):</span>
            <span>{{ number_format($payment['tax'], 0, ',', '.') }}</span>
        </div>
        <div class="calc-row">
            <span>Service ({{ $payment['service_rate'] }}%):</span>
            <span>{{ number_format($payment['service'], 0, ',', '.') }}</span>
        </div>
        <div class="calc-row total-row">
            <span>TOTAL:</span>
            <span>{{ number_format($payment['total'], 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="divider"></div>

    <!-- Payment Info -->
    <div class="payment-info">
        <div class="payment-row">
            <span>Metode Bayar:</span>
            <span>{{ ucfirst($payment['payment_method']) }}</span>
        </div>
        <div class="payment-row">
            <span>Jumlah Bayar:</span>
            <span>{{ number_format($payment['payment_amount'], 0, ',', '.') }}</span>
        </div>
        @if($payment['change'] > 0)
        <div class="payment-row change-row">
            <span>Kembalian:</span>
            <span>{{ number_format($payment['change'], 0, ',', '.') }}</span>
        </div>
        @endif
    </div>

    <div class="divider"></div>

    <!-- Footer -->
    <div class="footer">
        <div class="thank-you">TERIMA KASIH</div>
        <div>Silakan datang kembali</div>
        <div style="margin-top: 10px; font-size: 9px;">
            {{ $restaurant['tax_id'] }}<br>
            Struk ini sah sebagai bukti pembayaran
        </div>
    </div>
</body>
</html>
