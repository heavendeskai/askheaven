
import React, { useRef, useState, useEffect } from 'react';
import { FileText, Upload, Trash2, File as FileIcon, Sparkles, HardDrive, Cloud, Download, Loader2, Check } from 'lucide-react';
import { DocumentItem } from '../types';
import { Button } from './ui/Button';
import { handleAuthClick, listDriveFiles, getDriveFileContent, DriveFile, uploadToDrive } from '../services/gmail';

interface DocsViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onRemoveDocument: (id: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({ documents, onAddDocument, onRemoveDocument }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'drive'>('local');
  const [isDragging, setIsDragging] = useState(false);
  
  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isDriveAuth, setIsDriveAuth] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // --- LOCAL UPLOAD HANDLERS ---

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'text/plain',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        date: new Date().toLocaleDateString(),
        content: content
      };
      onAddDocument(newDoc);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
  };

  // --- DRIVE HANDLERS ---

  const handleConnectDrive = async () => {
      setIsLoadingDrive(true);
      try {
          await handleAuthClick();
          setIsDriveAuth(true);
          await fetchDriveFiles();
      } catch (e) {
          console.error("Drive connection failed", e);
      } finally {
          setIsLoadingDrive(false);
      }
  };

  const fetchDriveFiles = async () => {
      setIsLoadingDrive(true);
      try {
          const files = await listDriveFiles();
          setDriveFiles(files);
      } catch (e) {
          console.error("Failed to list files", e);
      } finally {
          setIsLoadingDrive(false);
      }
  };

  const handleImportFromDrive = async (file: DriveFile) => {
      setImportingId(file.id);
      try {
          const content = await getDriveFileContent(file.id, file.mimeType);
          const newDoc: DocumentItem = {
              id: `drive-${file.id}`,
              name: file.name,
              type: 'application/google-doc',
              size: 'Cloud', // Size isn't easily available in list view sometimes
              date: new Date(file.modifiedTime).toLocaleDateString(),
              content: content
          };
          onAddDocument(newDoc);
      } catch (e) {
          alert("Failed to import file content.");
      } finally {
          setImportingId(null);
      }
  };

  const handleSaveToDrive = async (doc: DocumentItem) => {
      try {
          await uploadToDrive(doc.name, doc.content);
          alert("Saved to Drive successfully.");
      } catch (e) {
          alert("Failed to save to Drive. Ensure you have granted permissions.");
      }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div 
        className={`w-96 bg-white border-r border-stone-100 flex flex-col transition-colors duration-300 ${isDragging ? 'bg-stone-50 border-stone-300 ring-2 ring-inset ring-stone-400' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6">
            <h2 className="font-serif font-semibold text-stone-900 text-xl mb-4">Knowledge Base</h2>
            
            {/* Tabs */}
            <div className="flex p-1 bg-stone-50 rounded-xl mb-6">
                <button 
                onClick={() => setActiveTab('local')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'local' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                <div className="flex items-center justify-center gap-2">
                    <HardDrive size={12} /> Local
                </div>
                </button>
                <button 
                onClick={() => setActiveTab('drive')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'drive' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                <div className="flex items-center justify-center gap-2">
                    <Cloud size={12} /> Google Drive
                </div>
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'local' ? (
                <>
                    <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                        Drag and drop files here to add them to Heaven's immediate context window.
                    </p>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden" 
                        accept=".txt,.md,.csv,.json"
                    />
                    
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full justify-center mb-6">
                        <Upload size={16} className="mr-2" /> Upload Text File
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                        Select files from your Cloud Drive to import them into the active session.
                    </p>
                    {!isDriveAuth ? (
                        <Button onClick={handleConnectDrive} variant="secondary" className="w-full justify-center mb-6">
                            {isLoadingDrive ? <Loader2 className="animate-spin" /> : <Cloud size={16} className="mr-2" />} Connect Drive
                        </Button>
                    ) : (
                         <div className="mb-4 flex justify-between items-center">
                            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Recent Files</span>
                            <button onClick={fetchDriveFiles} className="text-stone-400 hover:text-stone-900"><Loader2 size={12} className={isLoadingDrive ? 'animate-spin' : ''}/></button>
                         </div>
                    )}
                </>
            )}

            {/* FILE LIST */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[calc(100vh-280px)]">
                {activeTab === 'local' && (
                    <>
                        {documents.length === 0 && (
                            <div className="text-center text-stone-400 mt-10 text-xs italic border-2 border-dashed border-stone-100 rounded-xl p-8">
                                Drop files here
                            </div>
                        )}
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-start gap-3 group hover:shadow-sm transition-shadow">
                                <div className="mt-1 text-stone-400">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-stone-900 truncate" title={doc.name}>{doc.name}</div>
                                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                        {doc.size} • {doc.date} 
                                        {doc.id.startsWith('drive-') && <Cloud size={8} className="text-blue-400 ml-1" />}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleSaveToDrive(doc)}
                                        title="Save back to Drive"
                                        className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Cloud size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onRemoveDocument(doc.id)}
                                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'drive' && isDriveAuth && (
                    <div className="space-y-2">
                        {driveFiles.map(file => {
                            const isImported = documents.some(d => d.id === `drive-${file.id}`);
                            return (
                                <div key={file.id} className="bg-white border border-stone-100 rounded-xl p-3 flex items-center gap-3 hover:border-stone-300 transition-colors">
                                    <img src={file.iconLink} alt="" className="w-5 h-5 opacity-70" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-stone-900 truncate">{file.name}</div>
                                        <div className="text-[10px] text-stone-400">{new Date(file.modifiedTime).toLocaleDateString()}</div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        disabled={isImported || importingId === file.id}
                                        onClick={() => handleImportFromDrive(file)}
                                        className="h-8 w-8 p-0 flex items-center justify-center rounded-full bg-stone-50"
                                    >
                                        {importingId === file.id ? <Loader2 size={12} className="animate-spin" /> : 
                                         isImported ? <Check size={12} className="text-green-600" /> : <Download size={12} />}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className={`flex-1 bg-stone-50/50 flex flex-col items-center justify-center text-stone-400 p-12 text-center transition-colors duration-300 ${isDragging ? 'bg-stone-100/80' : ''}`}>
         {documents.length > 0 ? (
             <div className="max-w-md">
                 <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-500 animate-pulse">
                     <Sparkles size={24} />
                 </div>
                 <h3 className="text-xl font-serif text-stone-900 mb-3">Active Context: {documents.length} Docs</h3>
                 <p className="text-stone-600 mb-6 leading-relaxed text-sm">
                     Heaven has ingested these documents into its short-term memory. 
                     <br/>You can now ask strategic questions in the Chat.
                 </p>
                 <div className="flex flex-wrap justify-center gap-2">
                     {documents.map(d => (
                         <span key={d.id} className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-600 shadow-sm flex items-center gap-2">
                             {d.type.includes('google') ? <Cloud size={10} className="text-blue-500" /> : <FileText size={10} />}
                             {d.name}
                         </span>
                     ))}
                 </div>
             </div>
         ) : (
            <div className="max-w-md pointer-events-none">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${isDragging ? 'bg-blue-100 scale-110' : 'bg-stone-100'}`}>
                     <Upload className={`${isDragging ? 'text-blue-500' : 'text-stone-300'}`} size={32} />
                 </div>
                 <h3 className="text-lg font-serif text-stone-900 mb-2">
                    {isDragging ? 'Drop to Ingest' : 'Knowledge Base Empty'}
                 </h3>
                 <p className="text-sm text-stone-500">
                     {isDragging ? 'Release to add to context' : 'Drag files here or import from Drive to give Heaven specific knowledge.'}
                 </p>
            </div>
         )}
      </div>
    </div>
  );
};
