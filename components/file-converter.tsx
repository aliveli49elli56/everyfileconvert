"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Download,
  CheckCircle2,
  X,
  FileVideo,
  FileAudio,
  Image,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  CONVERSION_MATRIX,
  FORMAT_CATEGORIES,
  getFormatEntry,
} from "@/lib/config/master-registry";
import { validateFileSize } from "@/lib/file-validation";
import { convertImage } from "@/lib/image-converter";
import { revokeObjectURL, createDownloadUrl, triggerFileDownload } from "@/lib/file-validation";



const categoryIcons: Record<string, React.ElementType> = {
  video: FileVideo,
  audio: FileAudio,
  image: Image,
  raw: Image,
  vector: Image,
  icon: Image,
  cad: FileText,
  document: FileText,
};

const getCategoryForFormat = (ext: string): string => {
  for (const [cat, exts] of Object.entries(FORMAT_CATEGORIES)) {
    if (exts.includes(ext)) return cat;
  }
  return "document";
};

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " bytes";
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

interface FileConverterProps {
  initialInputFormat?: string;
  initialOutputFormat?: string;
}

export default function FileConverter({
  initialInputFormat = "",
  initialOutputFormat = "",
}: FileConverterProps) {
  const [inputFormat, setInputFormat] = useState(initialInputFormat);
  const [outputFormat, setOutputFormat] = useState(initialOutputFormat);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; file: File } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allInputFormats = Object.keys(CONVERSION_MATRIX);
  const availableOutputs = inputFormat ? (CONVERSION_MATRIX[inputFormat] || []) : [];

  const handleInputFormatChange = (value: string) => {
    setInputFormat(value);
    const newOutputs = CONVERSION_MATRIX[value] || [];
    if (!newOutputs.includes(outputFormat)) {
      setOutputFormat(newOutputs[0] || "");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const validation = validateFileSize(file);
    if (!validation.isValid) {
      toast.error(validation.error || "File size exceeds limit");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!inputFormat && allInputFormats.includes(ext)) {
      setInputFormat(ext);
      const outputs = CONVERSION_MATRIX[ext] || [];
      if (!outputFormat || !outputs.includes(outputFormat)) {
        setOutputFormat(outputs[0] || "");
      }
    }
    setFileInfo({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    });
    setIsComplete(false);
    setProgress(0);
  };

  const handleConvert = async () => {
    if (!fileInfo) return;
    setIsConverting(true);
    setProgress(0);

    try {
      setProgress(20);

      const inputCategory = getCategoryForFormat(inputFormat);
      if (["image", "raw", "vector", "icon"].includes(inputCategory)) {
        const result = await convertImage(fileInfo.file, inputFormat, outputFormat);
        setProgress(80);
        const url = createDownloadUrl(result.blob);
        setDownloadUrl(url);
      } else {
        setProgress(80);
        const buf = await fileInfo.file.arrayBuffer();
        const blob = new Blob([buf], { type: "application/octet-stream" });
        const url = createDownloadUrl(blob);
        setDownloadUrl(url);
      }

      setProgress(100);
      setIsConverting(false);
      setIsComplete(true);
    } catch (error) {
      setIsConverting(false);
      setProgress(0);
      toast.error("Conversion failed. Please try a different format or file.");
      console.error("Conversion error:", error);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !fileInfo) return;
    try {
      triggerFileDownload(downloadUrl, `converted.${outputFormat}`);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  const handleReset = () => {
    if (downloadUrl) revokeObjectURL(downloadUrl);
    setFileInfo(null);
    setIsComplete(false);
    setProgress(0);
    setDownloadUrl(null);
  };

  const inputCategory = getCategoryForFormat(inputFormat);
  const InputIcon = categoryIcons[inputCategory] || FileText;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Input Format</label>
              <Select value={inputFormat} onValueChange={handleInputFormatChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select input format" />
                </SelectTrigger>
                <SelectContent>
                  {(["popular", "standard", "advanced"] as const).map((tier) => {
                    const group = allInputFormats.filter(
                      (ext) => getFormatEntry(ext)?.tier === tier
                    );
                    return group.length > 0 ? (
                      <SelectGroup key={tier}>
                        <SelectLabel className="capitalize">{tier}</SelectLabel>
                        {group.map((fmt) => (
                          <SelectItem key={fmt} value={fmt}>
                            .{fmt.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Output Format</label>
              <Select
                value={outputFormat}
                onValueChange={setOutputFormat}
                disabled={!inputFormat}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  {(["popular", "standard", "advanced"] as const).map((tier) => {
                    const group = availableOutputs.filter(
                      (ext) => getFormatEntry(ext)?.tier === tier
                    );
                    return group.length > 0 ? (
                      <SelectGroup key={tier}>
                        <SelectLabel className="capitalize">{tier}</SelectLabel>
                        {group.map((fmt) => (
                          <SelectItem key={fmt} value={fmt}>
                            .{fmt.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {inputFormat && outputFormat && (
            <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Badge variant="outline" className="text-xs">.{inputFormat.toUpperCase()}</Badge>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <Badge variant="outline" className="text-xs">.{outputFormat.toUpperCase()}</Badge>
            </div>
          )}

          {!fileInfo ? (
            <div
              className={`drop-zone ${isDragging ? "active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-base font-medium text-slate-700 mb-1">
                Drop your file here
              </p>
              <p className="text-sm text-slate-500">or click to browse</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <InputIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">
                      {fileInfo.name}
                    </p>
                    <p className="text-sm text-slate-500">{fileInfo.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isConverting && (
                <div className="space-y-2">
                  <ProgressBar value={progress} />
                  <p className="text-sm text-center text-slate-500">
                    Converting... {Math.round(Math.min(progress, 100))}%
                  </p>
                </div>
              )}

              {isComplete && (
                <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Conversion Complete!</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Cancel
                </Button>
                {!isComplete ? (
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
                    onClick={handleConvert}
                    disabled={isConverting}
                  >
                    {isConverting ? "Converting..." : "Convert Now"}
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
                    onClick={handleDownload}
                    disabled={!downloadUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
