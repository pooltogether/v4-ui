export type CURRENCY_ID =
  | 'aed'
  | 'ars'
  | 'aud'
  | 'bdt'
  | 'bhd'
  | 'brl'
  | 'cad'
  | 'chf'
  | 'clp'
  | 'cny'
  | 'czk'
  | 'dkk'
  | 'eur'
  | 'gbp'
  | 'hkd'
  | 'huf'
  | 'idr'
  | 'ils'
  | 'inr'
  | 'jpy'
  | 'krw'
  | 'kwd'
  | 'lkr'
  | 'mmk'
  | 'mxn'
  | 'myr'
  | 'ngn'
  | 'nok'
  | 'nzd'
  | 'php'
  | 'pkr'
  | 'pln'
  | 'rub'
  | 'sar'
  | 'sek'
  | 'sgd'
  | 'thb'
  | 'try'
  | 'twd'
  | 'uah'
  | 'usd'
  | 'vef'
  | 'vnd'
  | 'zar'

export const SUPPORTED_CURRENCIES: Record<CURRENCY_ID, { name: string; symbol: string }> =
  Object.freeze({
    aed: {
      name: 'United Arab Emirates Dirham',
      symbol: 'DH'
    },
    ars: {
      name: 'Argentine Peso',
      symbol: '$'
    },
    aud: {
      name: 'Australian Dollar',
      symbol: 'A$'
    },
    bdt: {
      name: 'Bangladeshi Taka',
      symbol: '৳'
    },
    bhd: {
      name: 'Bahraini Dinar',
      symbol: 'BD'
    },
    brl: {
      name: 'Brazil Real',
      symbol: 'R$'
    },
    cad: {
      name: 'Canadian Dollar',
      symbol: 'CA$'
    },
    chf: {
      name: 'Swiss Franc',
      symbol: 'Fr.'
    },
    clp: {
      name: 'Chilean Peso',
      symbol: 'CLP$'
    },
    cny: {
      name: 'Chinese Yuan',
      symbol: '¥'
    },
    czk: {
      name: 'Czech Koruna',
      symbol: 'Kč'
    },
    dkk: {
      name: 'Danish Krone',
      symbol: 'kr.'
    },
    eur: {
      name: 'Euro',
      symbol: '€'
    },
    gbp: {
      name: 'British Pound Sterling',
      symbol: '£'
    },
    hkd: {
      name: 'Hong Kong Dollar',
      symbol: 'HK$'
    },
    huf: {
      name: 'Hungarian Forint',
      symbol: 'Ft'
    },
    idr: {
      name: 'Indonesian Rupiah',
      symbol: 'Rp'
    },
    ils: {
      name: 'Israeli New Shekel',
      symbol: '₪'
    },
    inr: {
      name: 'Indian Rupee',
      symbol: '₹'
    },
    jpy: {
      name: 'Japanese Yen',
      symbol: '¥'
    },
    krw: {
      name: 'South Korean Won',
      symbol: '₩'
    },
    kwd: {
      name: 'Kuwaiti Dinar',
      symbol: 'KD'
    },
    lkr: {
      name: 'Sri Lankan Rupee',
      symbol: 'Rs'
    },
    mmk: {
      name: 'Burmese Kyat',
      symbol: 'K'
    },
    mxn: {
      name: 'Mexican Peso',
      symbol: 'MX$'
    },
    myr: {
      name: 'Malaysian Ringgit',
      symbol: 'RM'
    },
    ngn: {
      name: 'Nigerian Naira',
      symbol: '₦'
    },
    nok: {
      name: 'Norwegian Krone',
      symbol: 'kr'
    },
    nzd: {
      name: 'New Zealand Dollar',
      symbol: 'NZ$'
    },
    php: {
      name: 'Philippine Peso',
      symbol: '₱'
    },
    pkr: {
      name: 'Pakistani Rupee',
      symbol: '₨'
    },
    pln: {
      name: 'Polish Zloty',
      symbol: 'zł'
    },
    rub: {
      name: 'Russian Ruble',
      symbol: '₽'
    },
    sar: {
      name: 'Saudi Riyal',
      symbol: 'SR'
    },
    sek: {
      name: 'Swedish Krona',
      symbol: 'kr'
    },
    sgd: {
      name: 'Singapore Dollar',
      symbol: 'S$'
    },
    thb: {
      name: 'Thai Baht',
      symbol: '฿'
    },
    try: {
      name: 'Turkish Lira',
      symbol: '₺'
    },
    twd: {
      name: 'New Taiwan Dollar',
      symbol: 'NT$'
    },
    uah: {
      name: 'Ukrainian hryvnia',
      symbol: '₴'
    },
    usd: {
      name: 'US Dollar',
      symbol: '$'
    },
    vef: {
      name: 'Venezuelan bolívar fuerte',
      symbol: 'Bs.F'
    },
    vnd: {
      name: 'Vietnamese đồng',
      symbol: '₫'
    },
    zar: {
      name: 'South African Rand',
      symbol: 'R'
    }
  })
