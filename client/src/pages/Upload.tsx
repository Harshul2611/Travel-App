import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../api/axios.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  Upload,
  FileText,
  Image,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await api.post("/itineraries/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Itinerary generated!");
      navigate(`/itinerary/${response.data.itinerary._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary rounded-full p-2">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">TripAI</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Travel Document
          </h1>
          <p className="text-gray-500 mt-2">
            Upload your flight ticket, hotel booking, or any travel document and
            we'll generate a complete itinerary using AI
          </p>
        </div>

        {/* Dropzone */}
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary hover:bg-primary/5"
                }
                ${file ? "border-green-400 bg-green-50" : ""}
              `}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="space-y-3">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-16 w-16 text-green-500 mx-auto" />
                  ) : (
                    <Image className="h-16 w-16 text-green-500 mx-auto" />
                  )}
                  <p className="font-semibold text-green-700">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-primary">
                    Click or drag to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-16 w-16 text-gray-300 mx-auto" />
                  {isDragActive ? (
                    <p className="text-primary font-medium">Drop it here!</p>
                  ) : (
                    <>
                      <p className="text-gray-600 font-medium">
                        Drag & drop your travel document
                      </p>
                      <p className="text-gray-400 text-sm">
                        or click to browse files
                      </p>
                    </>
                  )}
                  <p className="text-xs text-gray-400">
                    Supports PDF, JPG, PNG — Max 10MB
                  </p>
                </div>
              )}
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Itinerary...
                </>
              ) : (
                <>
                  <Plane className="mr-2 h-5 w-5" />
                  Generate Itinerary
                </>
              )}
            </Button>

            {loading && (
              <p className="text-center text-sm text-gray-400 mt-3">
                This may take 10–20 seconds...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
