import clsx from 'clsx';
import { ChevronDown, ChevronRight, FileCode2, Folder } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PullRequestFile, PullRequestFileStatus } from '../../types/github';
import { buildFileTree, type FileTreeNode } from '../../utils/fileTree';

const STATUS_LETTER: Partial<Record<PullRequestFileStatus, { letter: string; className: string }>> = {
  added: { letter: 'A', className: 'text-emerald-600' },
  removed: { letter: 'D', className: 'text-red-600' },
  modified: { letter: 'M', className: 'text-amber-600' },
  renamed: { letter: 'R', className: 'text-blue-600' },
};

interface DiffFileTreeProps {
  files: PullRequestFile[];
  selected: string | null;
  findingCounts: Map<string, number>;
  onSelect: (path: string) => void;
}

export function DiffFileTree({ files, selected, findingCounts, onSelect }: DiffFileTreeProps) {
  const tree = useMemo(() => buildFileTree(files.map((file) => file.filename)), [files]);
  const statusByPath = useMemo(() => new Map(files.map((file) => [file.filename, file.status])), [files]);

  return (
    <div className="text-sm">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selected={selected}
          statusByPath={statusByPath}
          findingCounts={findingCounts}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps extends Omit<DiffFileTreeProps, 'files'> {
  node: FileTreeNode;
  depth: number;
  statusByPath: Map<string, PullRequestFileStatus>;
}

function TreeNode({ node, depth, selected, statusByPath, findingCounts, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(true);
  const indent = { paddingLeft: `${depth * 12 + 8}px` };

  if (!node.isFile) {
    return (
      <div>
        <button type="button" onClick={() => setOpen(!open)} style={indent} className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-slate-600 hover:bg-slate-50">
          {open ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
          <Folder className="size-3.5 shrink-0 text-brand-400" />
          <span className="truncate">{node.name}</span>
        </button>
        {open &&
          node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selected={selected}
              statusByPath={statusByPath}
              findingCounts={findingCounts}
              onSelect={onSelect}
            />
          ))}
      </div>
    );
  }

  const status = STATUS_LETTER[statusByPath.get(node.path) ?? 'modified'];
  const count = findingCounts.get(node.path) ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(node.path)}
      style={indent}
      title={node.path}
      className={clsx(
        'flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left',
        selected === node.path ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700 hover:bg-slate-50',
      )}
    >
      <FileCode2 className="ml-5 size-3.5 shrink-0 text-slate-400" />
      <span className="flex-1 truncate">{node.name}</span>
      {count > 0 && <span className="rounded-full bg-red-100 px-1.5 text-[10px] font-semibold text-red-700">{count}</span>}
      {status && <span className={clsx('font-mono text-[10px] font-bold', status.className)}>{status.letter}</span>}
    </button>
  );
}
