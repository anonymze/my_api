import type React from "react";

import { Button } from "@/front/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
import { Input } from "@/front/components/ui/input";
import { Progress } from "@/front/components/ui/progress";
import { FileSpreadsheet, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function ImportTab() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Simulate data loading when component mounts
  useEffect(() => {
    // This would be your actual API call to get existing files
    console.log("Loading import data...");
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate file processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProcessingProgress(i);
    }

    setIsProcessing(false);
    // Here you would handle the actual file processing
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Importer les fichiers Excel de Commissions
        </CardTitle>
        <CardDescription>
          Téléchargez les fichiers Excel contenant les données de commissions.
          Formats supportés : .xlsx, .xls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Déposez vos fichiers Excel ici
            </p>
            <p className="text-sm text-muted-foreground">
              ou cliquez pour parcourir
            </p>
          </div>
          <Input
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="mt-4 max-w-xs mx-auto"
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Traitement des fichiers...</span>
            </div>
            <Progress value={processingProgress} className="w-full" />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">
              Fichiers Téléchargés ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={processFiles}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Traiter les Fichiers (${uploadedFiles.length})`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
