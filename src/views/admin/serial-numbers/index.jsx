import { useState, useEffect, useCallback } from 'react';
import { IconKey, IconRefresh, IconSearch } from '@tabler/icons-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { adminApi } from '../../../api/adminApi';

const FILTER_TABS = [
  { value: 'all', label: 'Semua', stat: 'total' },
  { value: 'unused', label: 'Belum Digunakan', stat: 'unused' },
  { value: 'used', label: 'Sudah Digunakan', stat: 'used' }
];

export default function SerialNumbersManagement() {
  const [tokenList, setTokenList] = useState([]);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenFilterStatus, setTokenFilterStatus] = useState('all');
  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenStats, setTokenStats] = useState({ total: 25, used: 0, unused: 25 });

  const fetchTokens = useCallback(async (status = 'all', search = '') => {
    setTokenLoading(true);
    try {
      const response = await adminApi.getPlacementTestTokens({ status, search, per_page: 100 });
      if (response?.success) {
        setTokenList(response.data || []);
        if (response.stats) setTokenStats(response.stats);
      }
    } catch (error) {
      console.warn('Gagal memuat token DPT:', error);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens(tokenFilterStatus, tokenSearch);
  }, [fetchTokens, tokenFilterStatus, tokenSearch]);

  const handleTabChange = (status) => {
    setTokenFilterStatus(status);
  };

  const handleSearchChange = (event) => {
    setTokenSearch(event.target.value);
  };

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            <IconKey size={28} className="text-amber-500" />
            Manajemen Serial Number / Token DPT
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar serial number Diagnostic Placement Test (DPT) untuk tes penempatan calon peserta PPB Bahasa Inggris.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchTokens(tokenFilterStatus, tokenSearch)} disabled={tokenLoading}>
          <IconRefresh size={18} className={tokenLoading ? 'animate-spin' : ''} />
          Muat Ulang
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-slate-500">TOTAL SERIAL NUMBER</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-950">{tokenStats.total}</p>
          <p className="mt-1 text-sm text-slate-500">Total kuota serial terdaftar di sistem</p>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold tracking-wider text-emerald-800">BELUM DIGUNAKAN (TERSEDIA)</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{tokenStats.unused}</p>
          <p className="mt-1 text-sm text-emerald-800">Siap dialokasikan otomatis ke calon peserta baru</p>
        </Card>
        <Card className="border-orange-200 bg-orange-50 p-5">
          <p className="text-xs font-bold tracking-wider text-orange-800">SUDAH DIGUNAKAN</p>
          <p className="mt-2 text-3xl font-extrabold text-orange-700">{tokenStats.used}</p>
          <p className="mt-1 text-sm text-orange-800">Telah dipasangkan ke peserta tes PPB Inggris</p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter serial number">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={tokenFilterStatus === tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tokenFilterStatus === tab.value
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label} ({tokenStats[tab.stat]})
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-sm">
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari serial / nama / email / ID registrasi..."
              value={tokenSearch}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-[600px] overflow-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14">No</TableHead>
                <TableHead>Nomor Serial (DPT)</TableHead>
                <TableHead>Waktu Aktif</TableHead>
                <TableHead>Waktu Berakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ID Registrasi</TableHead>
                <TableHead>Nama Lengkap Peserta</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nomor HP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokenLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-12 text-center">
                    <span className="mx-auto block size-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                    <p className="mt-3 text-sm text-slate-500">Memuat data serial number...</p>
                  </TableCell>
                </TableRow>
              ) : tokenList.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    Tidak ada serial number yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : tokenList.map((token, index) => (
                <TableRow key={token.id || index}>
                  <TableCell className="text-slate-500">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-mono text-sm font-bold text-slate-950">{token.token_code}</p>
                    <p className="text-xs text-slate-500">Masa Aktif: {token.licence_length_days || 365} hari</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{token.activation_start_date || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-red-700">{token.expiry_date || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={token.is_used ? 'warning' : 'success'}>
                      {token.is_used ? 'Sudah Digunakan' : 'Belum Digunakan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-700">
                    {token.is_used ? (token.id_registrasi || `#${token.enrollment_id}`) : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{token.is_used ? (token.nama_lengkap || '-') : '-'}</TableCell>
                  <TableCell>{token.is_used ? (token.email || '-') : '-'}</TableCell>
                  <TableCell>{token.is_used ? (token.nomor_hp || '-') : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
