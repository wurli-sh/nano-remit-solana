import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { FileText, CheckCircle, Upload, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import cc from 'currency-codes'

import { NanoVaultLogo } from '@/assets'
import { Input } from '@/components/ui'
import { Toggle } from '@/components/common/Toggle'
import { MintSkeleton } from '@/components/common/Skeleton'
import { useMintNft } from '@/web3/hooks'
import { getExplorerTxUrl } from '@/web3/constants'
import { pinToIPFS } from '@/utils/api'
import { truncateAddress } from '@/utils/format'

const DEMO_URI = 'ipfs://bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenosa7777'

// Popular remittance currencies
const POPULAR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  'INR', 'CNY', 'KRW', 'SGD', 'HKD', 'MXN', 'BRL', 'ZAR',
  'NGN', 'KES', 'GHS', 'UGX', 'TZS', 'RWF', 'ETB', 'XOF', 'XAF',
]

// All ISO 4217 currency codes
const ALL_CURRENCIES = cc.codes()

export default function Mint() {
  const { publicKey, connected, connecting } = useWallet()

  const [mode, setMode] = useState<'demo' | 'upload'>('demo')
  const [file, setFile] = useState<File | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [receiver, setReceiver] = useState('')
  const [senderName, setSenderName] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [note, setNote] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUri, setUploadedUri] = useState<string | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const mintNft = useMintNft()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    if (selected.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }

    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file || !invoiceNumber || !dueDate || !counterparty || !amount || !receiver) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    try {
      const { ipfsUri, fileHash: hash } = await pinToIPFS({
        file,
        invoiceNumber,
        dueDate,
        counterparty,
        amount,
        currency,
        receiver,
        ...(senderName && { senderName }),
        ...(receiverName && { receiverName }),
        ...(note && { note }),
      })
      setUploadedUri(ipfsUri)
      setFileHash(hash)
      toast.success('Invoice uploaded to IPFS!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
      if (import.meta.env.DEV) {
        console.error('IPFS upload error:', err)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDemoMint = () => {
    mintNft.mint(DEMO_URI, 'Remittance Receipt')
  }

  const handleUploadMint = () => {
    if (!uploadedUri) return
    mintNft.mint(uploadedUri, 'Remittance Receipt')
  }

  if (connecting) {
    return <MintSkeleton />
  }

  if (!connected) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <FileText className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect to mint a remittance receipt.</p>
      </div>
    )
  }

  const walletLabel = publicKey ? truncateAddress(publicKey.toBase58()) : ''

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Mint Receipt</h1>
      </div>

      <div className="flex justify-center">
        <Toggle
          value={mode}
          options={[
            { value: 'demo', label: 'Demo' },
            { value: 'upload', label: 'Upload' },
          ]}
          onChange={(v) => { setMode(v); mintNft.reset() }}
        />
      </div>

      {mode === 'demo' ? (
        /* ── Demo mode ── */
        <div className="rounded-2xl border border-border bg-white p-8">
          <div className="mx-auto max-w-sm space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="size-8 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Demo Receipt NFT</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mint a demo remittance receipt for testing. Each receipt has a fixed notional value of 100 NanoUSD.
              </p>
            </div>
            <div className="rounded-xl bg-ghost p-4 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notional Value</span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <img src={NanoVaultLogo} alt="NanoUSD" className="size-4" />
                  100 NanoUSD
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono text-xs">{walletLabel}</span>
              </div>
            </div>
            {mintNft.isConfirmed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/60 p-4 text-primary">
                  <CheckCircle className="size-5" />
                  <span className="font-medium">Receipt minted!</span>
                </div>
                {mintNft.mintAddress && (
                  <div className="rounded-xl bg-secondary/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Mint Address</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                      {truncateAddress(mintNft.mintAddress.toBase58())}
                    </p>
                  </div>
                )}
                {mintNft.txSignature && (
                  <a
                    href={getExplorerTxUrl(mintNft.txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    View on explorer <ExternalLink className="size-3" />
                  </a>
                )}
                <button
                  onClick={mintNft.reset}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Mint another
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleDemoMint}
                  disabled={mintNft.isPending}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {mintNft.isPending ? (
                    <><Loader2 className="size-4 animate-spin" /> Minting…</>
                  ) : (
                    <><FileText className="size-4" /> Mint Receipt</>
                  )}
                </button>
                {mintNft.error && (
                  <p className="text-sm text-destructive">{mintNft.error.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Upload mode ── */
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Left: drop zone */}
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-8 md:w-72 md:shrink-0">
              <div className="flex size-14 items-center justify-center rounded-xl bg-white/70">
                {file ? (
                  <CheckCircle className="size-7 text-primary" />
                ) : (
                  <Upload className="size-7 text-primary" />
                )}
              </div>
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-charcoal">{file.name}</p>
                  <p className="mt-0.5 text-xs text-primary">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm font-semibold text-charcoal">Drag &amp; Drop PDF</p>
                  <p className="text-center text-xs text-charcoal/60">
                    Upload your remittance receipt or invoice to mint as an NFT.
                  </p>
                </>
              )}
              <label
                htmlFor="invoice-file"
                className="cursor-pointer rounded-full border border-charcoal/20 bg-white px-5 py-2 text-xs font-semibold text-charcoal transition hover:bg-ghost"
              >
                Browse Files
              </label>
              <p className="text-[10px] text-charcoal/50">Max size 10MB</p>
              <input
                id="invoice-file"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Right: form */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Invoice #</label>
                  <Input
                    placeholder="e.g. INV-2023-001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Counterparty</label>
                <Input
                  placeholder="Sender / Platform Name"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Amount</label>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <optgroup label="Popular">
                      {POPULAR_CURRENCIES.map((code) => {
                        const curr = cc.code(code)
                        return <option key={code} value={code}>{code} - {curr?.currency || code}</option>
                      })}
                    </optgroup>
                    <optgroup label="All Currencies">
                      {ALL_CURRENCIES.filter((c) => !POPULAR_CURRENCIES.includes(c)).map((code) => {
                        const curr = cc.code(code)
                        return <option key={code} value={code}>{code} - {curr?.currency || code}</option>
                      })}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-charcoal/70">Receiver Name</label>
                <Input
                  placeholder="Your Full Name"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Optional fields */}
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Sender Name</label>
                    <Input placeholder="Your name" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Recipient Full Name</label>
                    <Input placeholder="Recipient's full name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Note</label>
                  <Input placeholder="Additional notes (max 500 chars)" value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} className="mt-1" />
                </div>
              </div>

              {uploadedUri && (
                <div className="rounded-xl bg-secondary/50 p-3 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="size-4" />
                    <span className="font-medium">Uploaded to IPFS</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{uploadedUri}</p>
                  {fileHash && (
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground opacity-70">{fileHash}</p>
                  )}
                </div>
              )}

              {/* Action button */}
              {!uploadedUri ? (
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !file || !invoiceNumber || !dueDate || !counterparty || !amount || !receiver}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isUploading ? (
                    <><Loader2 className="size-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Upload className="size-4" /> Upload to IPFS</>
                  )}
                </button>
              ) : mintNft.isConfirmed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-secondary/60 p-4 text-primary">
                    <CheckCircle className="size-5" />
                    <span className="font-medium">Receipt minted!</span>
                  </div>
                  {mintNft.mintAddress && (
                    <div className="rounded-xl bg-secondary/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Mint Address</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                        {truncateAddress(mintNft.mintAddress.toBase58())}
                      </p>
                    </div>
                  )}
                  {mintNft.txSignature && (
                    <a
                      href={getExplorerTxUrl(mintNft.txSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View on explorer <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleUploadMint}
                    disabled={mintNft.isPending}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {mintNft.isPending ? (
                      <><Loader2 className="size-4 animate-spin" /> Minting…</>
                    ) : (
                      <><FileText className="size-4" /> Mint Receipt</>
                    )}
                  </button>
                  {mintNft.error && (
                    <p className="text-sm text-destructive">{mintNft.error.message}</p>
                  )}
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-primary" />
                    IPFS Pinning Status: Ready
                  </p>
                </div>
              )}

              {!uploadedUri && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block size-1.5 rounded-full bg-primary" />
                  IPFS Pinning Status: Ready
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
