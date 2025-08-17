// ClassLedger Pro – Production-grade React UI (single-file demo)
// Tech: React + Tailwind + shadcn/ui + lucide-react + framer-motion + recharts + sonner
// Usage:
// 1) Next.js (TS + Tailwind). Install deps:
//    npm i lucide-react framer-motion recharts zod react-hook-form sonner
//    npx shadcn@latest init
//    npx shadcn@latest add button card input table dialog select textarea badge tabs dropdown-menu progress label separator
// 2) Replace app/page.tsx with this file (or drop into src/App.tsx for Vite).
// 3) npm run dev

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Layers, IndianRupee, CalendarCheck, GraduationCap,
  MessageSquare, Settings, Plus, CheckCircle2, Download,
  SendHorizonal, Phone, Trash2, Pencil, Filter, Upload, FileDown, Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Toaster, toast } from 'sonner'

// -------------------------
// Types & Mock Data
// -------------------------

type Student = {
  id: string
  name: string
  phone?: string
  guardian?: string
  guardianPhone?: string
}

type Batch = {
  id: string
  name: string
  subject: string
  fee: number
  days: string
  time: string
}

type FeeRow = {
  id: string
  studentId: string
  month: string // YYYY-MM
  due: number
  paid: number
}

const fmt = new Intl.NumberFormat('en-IN')

const initialStudents: Student[] = [
  { id: 'S001', name: 'Aditi Ghosh', phone: '98300xxxxx', guardian: 'S. Ghosh', guardianPhone: '98300xxxxx' },
  { id: 'S002', name: 'Rahul Das', phone: '99030xxxxx', guardian: 'P. Das', guardianPhone: '99030xxxxx' },
  { id: 'S003', name: 'Moumita Roy', phone: '98740xxxxx', guardian: 'R. Roy', guardianPhone: '98740xxxxx' },
]

const initialBatches: Batch[] = [
  { id: 'B001', name: 'Class 10 – Math (Eve)', subject: 'Math', fee: 900, days: 'Mon,Wed,Fri', time: '18:00' },
  { id: 'B002', name: 'Class 9 – Science (Morn)', subject: 'Science', fee: 800, days: 'Tue,Thu,Sat', time: '08:00' },
]

const ymNow = new Date().toISOString().slice(0, 7)

const initialFees: FeeRow[] = [
  { id: 'F001', studentId: 'S001', month: ymNow, due: 900, paid: 900 },
  { id: 'F002', studentId: 'S002', month: ymNow, due: 900, paid: 0 },
  { id: 'F003', studentId: 'S003', month: ymNow, due: 800, paid: 400 },
]

const chartData = Array.from({ length: 6 }).map((_, i) => {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
  const label = d.toLocaleString('en-US', { month: 'short' })
  const dues = 18000 + Math.round(Math.random() * 8000)
  const paid = Math.round(dues * (0.55 + Math.random() * 0.35))
  return { month: label, dues, paid }
})

// -------------------------
// UI Primitives
// -------------------------

function StatCard({
  title, value, icon: Icon, trend, trendColor,
}: {
  title: string; value: string; icon: any; trend?: string; trendColor?: 'green' | 'red' | 'amber'
}) {
  const trendStyle = trendColor === 'red' ? 'text-red-500' : trendColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-neutral-50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-600">{title}</CardTitle>
          <div className="rounded-xl bg-neutral-100 p-2"><Icon className="h-4 w-4 text-neutral-600" /></div>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
        {trend && <div className={`mt-1 text-xs ${trendStyle}`}>{trend}</div>}
      </CardHeader>
      <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-neutral-100/60" />
    </Card>
  )
}

function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-sm text-neutral-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">{children}</kbd>
}

// -------------------------
// Main App
// -------------------------

export default function ClassLedgerPro() {
  const [students, setStudents] = React.useState<Student[]>(initialStudents)
  const [batches, setBatches] = React.useState<Batch[]>(initialBatches)
  const [fees, setFees] = React.useState<FeeRow[]>(initialFees)
  const [search, setSearch] = React.useState('')
  const [openStudent, setOpenStudent] = React.useState(false)
  const [openBatch, setOpenBatch] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'dues' | 'students' | 'batches' | 'messages' | 'settings'>('dashboard')

  const totalStudents = students.length
  const totalBatches = batches.length
  const month = ymNow
  const monthFees = fees.filter(f => f.month === month)
  const totalDue = monthFees.reduce((a, b) => a + b.due, 0)
  const totalPaid = monthFees.reduce((a, b) => a + b.paid, 0)
  const collectionRate = totalDue ? Math.round((totalPaid / totalDue) * 100) : 0

  const filteredStudents = students.filter(s =>
    [s.name, s.phone, s.guardian, s.guardianPhone].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  function addStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') || '').trim()
    if (!name) return
    const id = `S${String(students.length + 1).padStart(3, '0')}`
    const st: Student = {
      id,
      name,
      phone: String(fd.get('phone') || ''),
      guardian: String(fd.get('guardian') || ''),
      guardianPhone: String(fd.get('gphone') || ''),
    }
    setStudents(prev => [st, ...prev])
    setFees(prev => [{ id: `F${Date.now()}`, studentId: id, month, due: 900, paid: 0 }, ...prev])
    setOpenStudent(false)
    toast.success('Student added', { description: `${name} enrolled. Fee row created for ${month}.` })
  }

  function addBatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('bname') || '')
    const subject = String(fd.get('subject') || '')
    const fee = Number(fd.get('fee') || 800)
    const id = `B${String(batches.length + 1).padStart(3, '0')}`
    const bt: Batch = { id, name, subject, fee, days: String(fd.get('days') || ''), time: String(fd.get('time') || '') }
    setBatches(prev => [bt, ...prev])
    setOpenBatch(false)
    toast.success('Batch created', { description: `${name} (${subject}) at ₹${fee}/month` })
  }

  function payFee(row: FeeRow, amount: number) {
    setFees(prev => prev.map(f => f.id === row.id ? { ...f, paid: Math.min(f.due, f.paid + amount) } : f))
    toast.success('Payment recorded', { description: `${amount} received for ${studentName(row.studentId)}` })
  }

  function markPaid(row: FeeRow) {
    setFees(prev => prev.map(f => f.id === row.id ? { ...f, paid: f.due } : f))
    toast.success('Marked PAID', { description: `${studentName(row.studentId)} is cleared for ${row.month}` })
  }

  function studentName(id: string) {
    return students.find(s => s.id === id)?.name || id
  }

  function whatsappMessage(row: FeeRow) {
    const s = students.find(st => st.id === row.studentId)
    const balance = row.due - row.paid
    const msg = `Dear Parent${s?.guardian ? ' ' + s.guardian : ''}, fees for ${s?.name} (${row.month}) is pending. Outstanding: ₹${balance}. Kindly pay at your earliest. Thank you.`
    navigator.clipboard.writeText(msg)
    toast('Copied', { description: 'WhatsApp message copied to clipboard.' })
  }

  const pending = monthFees.filter(f => f.paid < f.due)
  const fullyPaid = monthFees.filter(f => f.paid >= f.due)

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <Toaster richColors position="top-right" />

      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium leading-tight text-neutral-900">ClassLedger Pro</div>
              <div className="text-xs text-neutral-500">Coaching Center OS</div>
            </div>
            <Badge variant="secondary" className="ml-2">MVP</Badge>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students, phone… (⌘K)" className="w-72 pl-8" />
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button onClick={() => setOpenStudent(true)} className="gap-2"><Plus className="h-4 w-4" /> New Student</Button>
            <Button variant="outline" onClick={() => setOpenBatch(true)} className="gap-2"><Layers className="h-4 w-4" /> New Batch</Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="md:hidden"><Filter className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOpenStudent(true)}><Plus className="mr-2 h-4 w-4" />New Student</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenBatch(true)}><Layers className="mr-2 h-4 w-4" />New Batch</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Shell */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            <SideItem icon={LayoutDashboard} label="Dashboard" active={activeTab==='dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SideItem icon={IndianRupee} label="Dues" active={activeTab==='dues'} onClick={() => setActiveTab('dues')} />
            <SideItem icon={Users} label="Students" active={activeTab==='students'} onClick={() => setActiveTab('students')} />
            <SideItem icon={Layers} label="Batches" active={activeTab==='batches'} onClick={() => setActiveTab('batches')} />
            <SideItem icon={MessageSquare} label="Messages" active={activeTab==='messages'} onClick={() => setActiveTab('messages')} />
            <Separator className="my-3" />
            <SideItem icon={Settings} label="Settings" active={activeTab==='settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <StatCard title="Students" value={String(totalStudents)} icon={Users} trend={`${totalStudents >= 10 ? '+3 this week' : '+1 today'}`} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <StatCard title="Batches" value={String(totalBatches)} icon={Layers} trend="Stable" trendColor="amber" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <StatCard title="This Month Dues" value={`₹${fmt.format(totalDue)}`} icon={IndianRupee} trend={`${collectionRate}% collected`} trendColor={collectionRate>70? 'green' : 'amber'} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <StatCard title="Attendance Today" value={`${Math.floor(0.85*totalStudents)}/${totalStudents}`} icon={CalendarCheck} trend="Est. 85% present" />
                </motion.div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Collections vs Dues</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="dues" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip formatter={(v: any) => `₹${fmt.format(Number(v))}`} />
                        <Area type="monotone" dataKey="dues" stroke="#ef4444" fill="url(#dues)" />
                        <Area type="monotone" dataKey="paid" stroke="#10b981" fill="url(#paid)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Collection Rate</CardTitle>
                    <CardDescription>{month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{collectionRate}%</div>
                    <Progress value={collectionRate} className="mt-4" />
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <div className="text-neutral-600">Collected</div>
                        <div className="text-lg font-semibold text-emerald-700">₹{fmt.format(totalPaid)}</div>
                      </div>
                      <div className="rounded-xl bg-rose-50 p-3">
                        <div className="text-neutral-600">Pending</div>
                        <div className="text-lg font-semibold text-rose-700">₹{fmt.format(totalDue-totalPaid)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Top Pending Dues</CardTitle>
                  <CardDescription>Actionable list for {month}. Click to copy WhatsApp message.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((r) => {
                        const bal = r.due - r.paid
                        return (
                          <TableRow key={r.id} className="hover:bg-neutral-50">
                            <TableCell className="font-medium">{studentName(r.studentId)}</TableCell>
                            <TableCell>₹{fmt.format(r.due)}</TableCell>
                            <TableCell>₹{fmt.format(r.paid)}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">₹{fmt.format(bal)}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="secondary" onClick={() => whatsappMessage(r)} className="gap-1"><SendHorizonal className="h-4 w-4" /> WhatsApp</Button>
                              <Button size="sm" onClick={() => payFee(r, Math.max(200, bal))} className="gap-1"><IndianRupee className="h-4 w-4" /> Quick Pay</Button>
                              <Button size="sm" variant="outline" onClick={() => markPaid(r)} className="gap-1"><CheckCircle2 className="h-4 w-4" /> Mark Paid</Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'dues' && (
            <div className="space-y-4">
              <SectionTitle title="Fees & Dues" description={`Manage monthly fees for ${month}`} action={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>} />
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                  <TabsTrigger value="paid">Paid ({fullyPaid.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                  <FeeTable rows={pending} studentName={studentName} onPay={payFee} onPaid={markPaid} onCopy={whatsappMessage} />
                </TabsContent>
                <TabsContent value="paid">
                  <FeeTable rows={fullyPaid} studentName={studentName} onPay={payFee} onPaid={markPaid} onCopy={whatsappMessage} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              <SectionTitle title="Students" description="Add, edit and search students." action={<Button className="gap-2" onClick={() => setOpenStudent(true)}><Plus className="h-4 w-4" /> Add</Button>} />
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Guardian</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Guardian Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(s => (
                        <TableRow key={s.id}>
                          <TableCell>{s.id}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.guardian || '-'}</TableCell>
                          <TableCell>{s.phone || '-'}</TableCell>
                          <TableCell>{s.guardianPhone || '-'}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="secondary" className="gap-1"><Pencil className="h-4 w-4" /> Edit</Button>
                            <Button size="sm" variant="outline" className="gap-1"><Trash2 className="h-4 w-4" /> Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="space-y-4">
              <SectionTitle title="Batches" description="Create and manage batches." action={<Button variant="outline" onClick={() => setOpenBatch(true)} className="gap-2"><Plus className="h-4 w-4" /> New Batch</Button>} />
              <div className="grid gap-4 md:grid-cols-2">
                {batches.map(b => (
                  <Card key={b.id} className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{b.name}</CardTitle>
                        <Badge variant="secondary">₹{b.fee}/mo</Badge>
                      </div>
                      <CardDescription>{b.subject} • {b.days} • {b.time}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-sm text-neutral-600">Auto-dues every {month}</div>
                      <div className="space-x-2">
                        <Button size="sm" variant="secondary" className="gap-1"><Pencil className="h-4 w-4" /> Edit</Button>
                        <Button size="sm" variant="outline" className="gap-1"><Trash2 className="h-4 w-4" /> Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>WhatsApp Reminders</CardTitle>
                <CardDescription>Click copy → paste into WhatsApp web/app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.map((r) => {
                  const s = students.find(st => st.id === r.studentId)
                  const bal = r.due - r.paid
                  const msg = `Dear Parent${s?.guardian ? ' ' + s.guardian : ''}, fees for ${s?.name} (${r.month}) is pending. Outstanding: ₹${bal}. Kindly pay at your earliest. Thank you.`
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <div className="font-medium">{s?.name} <span className="text-sm text-neutral-500">({r.month})</span></div>
                        <div className="text-sm text-neutral-600">Balance: ₹{fmt.format(bal)}</div>
                      </div>
                      <div className="space-x-2">
                        <Button variant="secondary" size="sm" className="gap-1" onClick={() => { navigator.clipboard.writeText(msg); toast('Copied', { description: 'Message copied.' }) }}>
                          <Phone className="h-4 w-4" /> Copy Message
                        </Button>
                        <Button size="sm" onClick={() => markPaid(r)} className="gap-1"><CheckCircle2 className="h-4 w-4" /> Mark Paid</Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Brand, receipt prefix, currency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Center Name</Label>
                    <Input placeholder="Your Coaching Center" defaultValue="Your Coaching Center" />
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <Input placeholder="Owner Name" defaultValue="Owner Name" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="99999xxxxx" defaultValue="99999xxxxx" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input defaultValue="₹" className="w-24" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>WhatsApp Prefix</Label>
                    <Input defaultValue="Dear Parent" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border bg-neutral-50 p-3 text-sm">
                  <div>
                    <div className="font-medium">Weekly Drive Backup</div>
                    <div className="text-neutral-600">Export CSV ZIP every Sunday 9:00 PM</div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="secondary" className="gap-2"><Upload className="h-4 w-4" /> Run Now</Button>
                    <Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Download ZIP</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Student Dialog */}
      <Dialog open={openStudent} onOpenChange={setOpenStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Student</DialogTitle>
            <DialogDescription>Enroll a student and auto-create this month's fee row.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addStudent} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input name="name" required placeholder="Full name" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" placeholder="Student phone" />
              </div>
              <div>
                <Label>Guardian</Label>
                <Input name="guardian" placeholder="Guardian name" />
              </div>
              <div>
                <Label>Guardian Phone</Label>
                <Input name="gphone" placeholder="Guardian phone" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="gap-2"><Plus className="h-4 w-4" /> Add Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Dialog */}
      <Dialog open={openBatch} onOpenChange={setOpenBatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Batch</DialogTitle>
            <DialogDescription>Create a batch with default monthly fee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addBatch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Batch Name</Label>
                <Input name="bname" required placeholder="Class 10 – Math (Eve)" />
              </div>
              <div>
                <Label>Subject</Label>
                <Input name="subject" defaultValue="Math" />
              </div>
              <div>
                <Label>Monthly Fee</Label>
                <Input name="fee" type="number" defaultValue={800} />
              </div>
              <div>
                <Label>Days</Label>
                <Input name="days" defaultValue="Mon,Wed,Fri" />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input name="time" defaultValue="17:30" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="gap-2"><Plus className="h-4 w-4" /> Create Batch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="mx-auto max-w-7xl px-4 py-10 text-center text-xs text-neutral-500">
        Press <Kbd>⌘</Kbd><Kbd>K</Kbd> to search · Built with <span className="font-medium">shadcn/ui</span>
      </footer>
    </div>
  )
}

function SideItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
      <span className="font-medium">{label}</span>
    </button>
  )
}

function FeeTable({
  rows, studentName, onPay, onPaid, onCopy,
}: {
  rows: FeeRow[]; studentName: (id: string) => string; onPay: (r: FeeRow, amt: number) => void; onPaid: (r: FeeRow) => void; onCopy: (r: FeeRow) => void
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => {
              const bal = r.due - r.paid
              const status = bal <= 0 ? 'PAID' : r.paid > 0 ? 'PARTIAL' : 'DUE'
              return (
                <TableRow key={r.id} className="hover:bg-neutral-50">
                  <TableCell className="font-medium">{studentName(r.studentId)}</TableCell>
                  <TableCell>{r.month}</TableCell>
                  <TableCell>₹{fmt.format(r.due)}</TableCell>
                  <TableCell>₹{fmt.format(r.paid)}</TableCell>
                  <TableCell>
                    <Badge variant={status==='PAID' ? 'secondary' : status==='PARTIAL' ? 'outline' : 'destructive'}>
                      {status==='PAID' ? 'Cleared' : status==='PARTIAL' ? `₹${fmt.format(bal)} left` : `₹${fmt.format(bal)} due`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {bal>0 && <Button size="sm" variant="secondary" onClick={() => onCopy(r)} className="gap-1"><SendHorizonal className="h-4 w-4" /> Copy Msg</Button>}
                    {bal>0 && <Button size="sm" onClick={() => onPay(r, Math.max(200, bal))} className="gap-1"><IndianRupee className="h-4 w-4" /> Quick Pay</Button>}
                    <Button size="sm" variant="outline" onClick={() => onPaid(r)} className="gap-1"><CheckCircle2 className="h-4 w-4" /> Mark Paid</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
