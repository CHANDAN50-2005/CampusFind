import { Link } from 'react-router';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { FormField, PageHeader } from '../components/UI.jsx';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-400';

export function ReportPage() {
  return <>
    <Link to="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Dashboard</Link>
    <PageHeader eyebrow="Campus reports" title="Report an item" description="Share the details that can help connect this item with its owner." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,700px)_minmax(240px,1fr)]">
      <form onSubmit={(event) => event.preventDefault()} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Report type"><select className={inputClass} defaultValue="lost" disabled><option value="lost">I lost an item</option><option value="found">I found an item</option></select></FormField>
          <FormField label="Category"><select className={inputClass} defaultValue="" disabled><option value="">Select a category</option></select></FormField>
        </div>
        <FormField label="Item name"><input className={inputClass} placeholder="For example, blue water bottle" disabled /></FormField>
        <FormField label="Description" hint="Include identifying details, but keep one ownership detail private for verification."><textarea className={`${inputClass} min-h-28 resize-y`} placeholder="Describe the item and any distinguishing features…" disabled /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Location"><input className={inputClass} placeholder="Where was it lost or found?" disabled /></FormField>
          <FormField label="Date"><input type="date" className={inputClass} disabled /></FormField>
        </div>
        <FormField label="Photo (optional)" hint="Image upload will be enabled with the upload service integration.">
          <div className="flex min-h-28 items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-sm text-slate-500"><ImagePlus size={20} /> Photo upload unavailable</div>
        </FormField>
        <button disabled className="w-full cursor-not-allowed rounded-xl bg-blue-500/50 px-4 py-3 text-sm font-semibold text-white/70">Report submission coming soon</button>
      </form>
      <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
        <h2 className="font-medium text-slate-200">Before you submit</h2>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-400"><li>Do not include passwords, student IDs, or other sensitive details.</li><li>Keep one unique identifying detail private so an owner can verify a claim.</li><li>Match suggestions are helpful leads, not proof of ownership.</li></ul>
        <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">Form fields are a UI scaffold. Report creation will be enabled when the authenticated item API is implemented.</p>
      </aside>
    </div>
  </>;
}
