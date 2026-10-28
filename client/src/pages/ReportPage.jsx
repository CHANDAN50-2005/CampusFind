import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { FormField, PageHeader } from '../components/UI.jsx';
import api from '../services/api.js';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-400';
const categories = [['electronics', 'Electronics'], ['accessories', 'Accessories'], ['books', 'Books'], ['clothing', 'Clothing'], ['id-cards', 'ID cards'], ['keys', 'Keys'], ['bags', 'Bags'], ['other', 'Other']];

function localDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: 'lost', category: '', itemName: '', description: '', location: '', dateOfIncident: localDate() });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) payload.append('image', image);
    try {
      const { data } = await api.post('/items', payload);
      navigate('/items/' + data.item._id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <Link to="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Dashboard</Link>
    <PageHeader eyebrow="Campus reports" title="Report an item" description="Share the details that can help connect this item with its owner." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,700px)_minmax(240px,1fr)]">
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-5 sm:p-7">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-300">What are you reporting?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['lost', 'I lost an item', 'I’m looking for something I misplaced.'], ['found', 'I found an item', 'I have something that may belong to someone.']].map(([type, title, description]) => <button key={type} type="button" aria-pressed={form.type === type} onClick={() => update('type', type)} className={'rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300 ' + (form.type === type ? 'border-blue-400 bg-blue-500/10 text-white' : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500')}><span className="block font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></button>)}
          </div>
        </fieldset>
        <FormField label="Category"><select className={inputClass} required value={form.category} onChange={(event) => update('category', event.target.value)}><option value="">Select a category</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>
        <FormField label="Item name"><input className={inputClass} required minLength={2} maxLength={120} value={form.itemName} onChange={(event) => update('itemName', event.target.value)} placeholder="For example, blue water bottle" /></FormField>
        <FormField label="Description" hint="Include identifying details that are safe to share."><textarea required minLength={8} maxLength={2000} value={form.description} onChange={(event) => update('description', event.target.value)} className={inputClass + ' min-h-28 resize-y'} placeholder="Describe the item and any distinguishing features…" /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Location"><input className={inputClass} required minLength={2} maxLength={160} value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Where was it lost or found?" /></FormField>
          <FormField label="Date"><input type="date" required max={localDate()} className={inputClass} value={form.dateOfIncident} onChange={(event) => update('dateOfIncident', event.target.value)} /></FormField>
        </div>
        <FormField label="Photo (optional)" hint="JPG, PNG, or WebP, up to 5 MB.">
          <label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-sm text-slate-400 hover:border-blue-400/60"><ImagePlus size={20} />{image ? image.name : 'Choose an item photo'}<input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>
        </FormField>
        {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <button disabled={submitting} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Saving report…' : 'Submit report'}</button>
      </form>
      <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
        <h2 className="font-medium text-slate-200">Before you submit</h2>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-400"><li>Do not include passwords, student IDs, or other sensitive details.</li><li>Claims are reviewed by the report owner or an administrator.</li><li>Match suggestions help connect reports; they do not prove ownership.</li></ul>
      </aside>
    </div>
  </>;
}
