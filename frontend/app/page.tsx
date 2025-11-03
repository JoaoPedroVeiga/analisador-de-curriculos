'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

// Tipos melhorados
interface AnalysisResult {
  analysis: {
    summary: string;
    strengths: string[];
    improvements: string[];
    score: {
      technical: number;
      communication: number;
      experience: number;
      overall: number;
    };
  };
  fileName: string;
  analysisDate: string;
}

interface UploadProgress {
  stage: 'uploading' | 'processing' | 'analyzing';
  progress: number;
  message: string;
}

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [filePreview, setFilePreview] = useState<{ name: string; size: string } | null>(null);

  // Função de upload melhorada com progresso
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploading(true);
    setFilePreview({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });

    // Simulação de progresso
    setUploadProgress({ stage: 'uploading', progress: 0, message: 'Enviando arquivo...' });
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev ? {
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      } : null);
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress({ stage: 'processing', progress: 30, message: 'Processando PDF...' });

      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 segundos timeout
      });

      clearInterval(progressInterval);
      setUploadProgress({ stage: 'analyzing', progress: 100, message: 'Análise concluída!' });

      // Pequeno delay para mostrar 100%
      setTimeout(() => {
        setResult(response.data);
        setUploadProgress(null);
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Erro no upload:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Erro ao analisar currículo. Tente novamente.';
      
      setError(errorMessage);
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  }, []);

  // Configuração do dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Cálculo de cores baseado na pontuação
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💡';
  };

  // Componente de Score Card
  const ScoreCard = useMemo(() => ({ score, label }: { score: number; label: string }) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 ${getScoreColor(score)}`}
    >
      <div className="text-2xl font-bold mb-1">{score}</div>
      <div className="text-sm font-medium text-center">{label}</div>
      <div className="text-lg mt-1">{getScoreEmoji(score)}</div>
    </motion.div>
  ), []);

  // Componente de Progress Bar
  const ProgressBar = () => {
    if (!uploadProgress) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto mt-6"
      >
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{uploadProgress.message}</span>
          <span>{uploadProgress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress.progress}%` }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Analisador de Currículos IA
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Obtenha uma análise profissional detalhada do seu currículo com inteligência artificial. 
            Descubra pontos fortes e oportunidades de melhoria.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Upload Area */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div
                  {...getRootProps()}
                  className={`
                    relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer 
                    transition-all duration-300 group
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50/50 scale-105' 
                      : isDragReject
                      ? 'border-red-500 bg-red-50/50'
                      : 'border-gray-300/80 hover:border-blue-400 hover:bg-blue-50/30'
                    }
                    ${uploading ? 'opacity-60 pointer-events-none' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  
                  <div className="space-y-6">
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mt-4">
                          {uploadProgress?.stage === 'uploading' && 'Enviando arquivo...'}
                          {uploadProgress?.stage === 'processing' && 'Processando PDF...'}
                          {uploadProgress?.stage === 'analyzing' && 'Analisando com IA...'}
                        </p>
                        {filePreview && (
                          <p className="text-sm text-gray-500 mt-2">
                            {filePreview.name} ({filePreview.size})
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {isDragActive ? 'Solte seu currículo aqui' : 'Envie seu currículo'}
                          </h3>
                          <p className="text-gray-600 text-lg">
                            Arraste ou clique para fazer upload
                          </p>
                          <p className="text-sm text-gray-500">
                            Suporte apenas para PDF • Máx. 10MB
                          </p>
                        </div>

                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Análise gratuita</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Resultados instantâneos</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <ProgressBar />

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Features Grid */}
              {!uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {[
                    {
                      icon: '🤖',
                      title: 'Análise IA Avançada',
                      description: 'Tecnologia GPT-4 para insights profundos'
                    },
                    {
                      icon: '⚡',
                      title: 'Resultados Rápidos',
                      description: 'Análise completa em menos de 30 segundos'
                    },
                    {
                      icon: '🔒',
                      title: 'Privacidade Garantida',
                      description: 'Seus dados são processados com segurança'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Results Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Análise Concluída!</h2>
                        <p className="text-gray-600">
                          Arquivo: <span className="font-medium">{result.fileName}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => { setResult(null); setError(null); }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      📄 Nova Análise
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>
                </div>

                {/* Score Cards */}
                {result.analysis.score && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                  >
                    <ScoreCard score={result.analysis.score.overall} label="Geral" />
                    <ScoreCard score={result.analysis.score.technical} label="Técnico" />
                    <ScoreCard score={result.analysis.score.experience} label="Experiência" />
                    <ScoreCard score={result.analysis.score.communication} label="Comunicação" />
                  </motion.div>
                )}
              </div>

              {/* Analysis Results */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">📋</span>
                    Resumo Profissional
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {result.analysis.summary}
                    </p>
                  </div>
                </motion.div>

                {/* Strengths */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">💪</span>
                    Pontos Fortes
                  </h3>
                  <div className="space-y-4">
                    {result.analysis.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-green-50 border border-green-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-green-800 font-medium">{strength}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Improvements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">🚀</span>
                    Sugestões de Melhoria
                  </h3>
                  <div className="space-y-4">
                    {result.analysis.improvements.map((improvement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <p className="text-yellow-800 font-medium">{improvement}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Tips Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="text-2xl mr-3">💡</span>
                    Próximos Passos
                  </h3>
                  <ul className="space-y-3 text-purple-100">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Revise as sugestões de melhoria</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Atualize seu currículo</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Compartilhe com colegas</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Faça uma nova análise</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}