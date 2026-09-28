import { FileCode2, Folder, ShieldAlert } from 'lucide-react';
import { Tilt } from '../../../components/ui/Tilt';

const FILES = ['auth.service.ts', 'auth.controller.ts', 'types.ts', 'utils.ts'];

const CODE: Array<{ text: string; type?: 'add' | 'del' | 'flag' }> = [
  { text: 'const token = await this.sign(user);' },
  { text: "const secret = 'super-secret-key';", type: 'flag' },
  { text: 'return this.jwt.verify(token);', type: 'add' },
  { text: 'if (!token) throw new Error();', type: 'add' },
  { text: '// TODO: rotate keys', type: 'del' },
];

/** Static illustration of a review for the landing hero. */
export function ReviewPreview() {
  return (
    <div className="float-3d mx-auto w-full max-w-lg">
    <Tilt max={10} className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-brand-900/10">
        <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-300" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 text-xs text-slate-400">Pull Request #142</span>
        </div>
        <div className="grid grid-cols-[150px_1fr]">
          <div className="space-y-1 border-r border-slate-100 p-3 text-xs text-slate-600">
            <p className="flex items-center gap-1.5 font-medium text-slate-800">
              <Folder className="size-3.5 text-brand-500" /> src
            </p>
            {FILES.map((file, index) => (
              <p key={file} className={`flex items-center gap-1.5 rounded px-1.5 py-1 ${index === 0 ? 'bg-brand-50 text-brand-700' : ''}`}>
                <FileCode2 className="size-3.5" /> {file}
              </p>
            ))}
          </div>
          <div className="space-y-1 p-3 font-mono text-[11px]">
            {CODE.map((line, index) => (
              <p
                key={index}
                className={
                  line.type === 'flag'
                    ? 'rounded bg-red-50 px-2 py-1 text-red-700'
                    : line.type === 'add'
                      ? 'rounded bg-emerald-50 px-2 py-1 text-emerald-800'
                      : line.type === 'del'
                        ? 'rounded bg-slate-50 px-2 py-1 text-slate-400 line-through'
                        : 'px-2 py-1 text-slate-600'
                }
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="depth-2 absolute -bottom-10 -left-6 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <ShieldAlert className="size-3.5 text-brand-600" /> AI Review
        </p>
        <div className="flex items-start gap-2">
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">High</span>
          <div>
            <p className="text-xs font-medium text-slate-800">Potential security issue</p>
            <p className="text-[11px] text-slate-500">Avoid hardcoding secrets. Use environment variables.</p>
          </div>
        </div>
      </div>
    </Tilt>
    </div>
  );
}
