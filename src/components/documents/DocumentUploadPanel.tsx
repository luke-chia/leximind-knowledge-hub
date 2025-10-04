import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, FileText, Database, Brain, CheckCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useFilterEntities } from '@/hooks/useFilterEntities'
import { useDocumentUpload } from '@/hooks/useDocumentUpload'
import type { DocumentFormData } from '@/services/documents/types'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  alias: z
    .string()
    .min(1, { message: 'Alias is required' })
    .max(100, { message: 'Alias must be less than 100 characters' }),
  description: z.string().min(1, { message: 'Description is required' }),
  url_reference: z
    .string()
    .url({ message: 'Must be a valid URL' })
    .optional()
    .or(z.literal('')),
  areas: z.number({ required_error: 'At least one area is required' }),
  categories: z
    .array(z.number())
    .min(1, { message: 'At least one category is required' }),
  sources: z
    .array(z.number())
    .min(1, { message: 'At least one source is required' }),
  tags: z.array(z.number()).optional().default([]),
})

interface DocumentUploadPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const { data: filterEntities, isLoading: filtersLoading } =
    useFilterEntities()
  const { isUploading, uploadProgress, handleUpload } = useDocumentUpload()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alias: '',
      description: '',
      url_reference: '',
      areas: undefined,
      categories: [],
      sources: [],
      tags: [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) return

    const formData: DocumentFormData = {
      file: selectedFile,
      alias: values.alias,
      description: values.description,
      url_reference: values.url_reference || '',
      areas: [values.areas],
      categories: values.categories,
      sources: values.sources,
      tags: values.tags,
    }

    const result = await handleUpload(formData, filterEntities)

    if (result.success) {
      // Reset form and close panel
      form.reset()
      setSelectedFile(null)
      setTimeout(() => {
        onOpenChange(false)
      }, 2000) // Close after showing success message
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        form.setError('file', { message: 'Only PDF files are allowed' })
        return
      }

      setSelectedFile(file)
      form.setValue('file', file)
      form.clearErrors('file')

      // Auto-generate alias from filename
      const aliasFromFile = file.name.replace(/\.[^/.]+$/, '')
      form.setValue('alias', aliasFromFile)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          form.setError('file', { message: 'Only PDF files are allowed' })
          return
        }
        setSelectedFile(file)
        form.setValue('file', file)
        form.clearErrors('file')
        const aliasFromFile = file.name.replace(/\.[^/.]+$/, '')
        form.setValue('alias', aliasFromFile)
      }
    }
  }

  const getStepIcon = (step: number, currentStep: number) => {
    if (currentStep > step)
      return <CheckCircle className="h-5 w-5 text-green-500" />

    const icons = {
      1: <Upload className="h-5 w-5" />,
      2: <FileText className="h-5 w-5" />,
      3: <Brain className="h-5 w-5" />,
      4: <Database className="h-5 w-5" />,
      5: <Brain className="h-5 w-5" />,
    }

    return icons[step] || <Upload className="h-5 w-5" />
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-background border-l border-border overflow-y-auto"
      >
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              {t('upload_panel.title')}
            </SheetTitle>
          </div>
        </SheetHeader>

        {isUploading && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">
                {uploadProgress.message}
              </h3>
              <Progress value={uploadProgress.progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {uploadProgress.progress}
                {t('upload_panel.complete')}
              </p>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step}>
                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      uploadProgress.step >= step
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {getStepIcon(step, uploadProgress.step)}
                    <span className="font-medium">
                      {step === 1 && t('upload_panel.uploading')}
                      {step === 2 && t('upload_panel.sent')}
                      {step === 3 && t('upload_panel.embeddings')}
                      {step === 4 && t('upload_panel.saving_db')}
                      {step === 5 && t('upload_panel.saving_memory')}
                    </span>
                  </div>
                  {step === 5 && uploadProgress.step === 5 && (
                    <p className="text-xs text-amber-600 mt-2 ml-9">
                      {t('upload_panel.warning_message')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUploading && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-6"
            >
              {/* File Upload */}
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('upload_panel.file_label')}</FormLabel>
                    <FormControl>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                          'border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors',
                          dragActive && 'border-primary bg-primary/10'
                        )}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {selectedFile ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-primary" />
                              <p className="font-medium text-foreground">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                                MB
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="font-medium text-foreground">
                                {t('upload_panel.choose_file')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t('upload_panel.drag_drop')}
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alias */}
              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('upload_panel.alias_label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('upload_panel.alias_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('upload_panel.description_label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('upload_panel.description_placeholder')}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URL Reference */}
              <FormField
                control={form.control}
                name="url_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('upload_panel.url_reference_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t(
                          'upload_panel.url_reference_placeholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Areas */}
              <FormField
                control={form.control}
                name="areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('upload_panel.areas_label')}{' '}
                      {filtersLoading && `(${t('upload_panel.loading')})`}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={filtersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue
                            placeholder={t('upload_panel.areas_placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border z-50">
                        {filterEntities?.areas?.map((area) => (
                          <SelectItem
                            key={area.id}
                            value={area.id.toString()}
                            className="hover:bg-accent"
                          >
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categories */}
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('upload_panel.categories_label')}{' '}
                      {filtersLoading && `(${t('upload_panel.loading')})`}
                    </FormLabel>
                    <Select
                      value="" // Reset select value
                      onValueChange={(value) => {
                        const categoryId = parseInt(value)
                        if (!field.value.includes(categoryId)) {
                          field.onChange([...field.value, categoryId])
                        }
                      }}
                      disabled={filtersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue
                            placeholder={t(
                              'upload_panel.categories_placeholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border z-50">
                        {filterEntities?.categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                            className="hover:bg-accent"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((categoryId) => {
                        const category = filterEntities?.categories?.find(
                          (c) => c.id === categoryId
                        )
                        return (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category?.name}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((id) => id !== categoryId)
                                )
                              }}
                            />
                          </Badge>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sources */}
              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('upload_panel.sources_label')}{' '}
                      {filtersLoading && `(${t('upload_panel.loading')})`}
                    </FormLabel>
                    <Select
                      value="" // Reset select value
                      onValueChange={(value) => {
                        const sourceId = parseInt(value)
                        if (!field.value.includes(sourceId)) {
                          field.onChange([...field.value, sourceId])
                        }
                      }}
                      disabled={filtersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue
                            placeholder={t('upload_panel.sources_placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border z-50">
                        {filterEntities?.sources?.map((source) => (
                          <SelectItem
                            key={source.id}
                            value={source.id.toString()}
                            className="hover:bg-accent"
                          >
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((sourceId) => {
                        const source = filterEntities?.sources?.find(
                          (s) => s.id === sourceId
                        )
                        return (
                          <Badge
                            key={sourceId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {source?.name}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((id) => id !== sourceId)
                                )
                              }}
                            />
                          </Badge>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('upload_panel.tags_label')}{' '}
                      {filtersLoading && `(${t('upload_panel.loading')})`}
                    </FormLabel>
                    <Select
                      value="" // Reset select value
                      onValueChange={(value) => {
                        const tagId = parseInt(value)
                        if (!field.value.includes(tagId)) {
                          field.onChange([...field.value, tagId])
                        }
                      }}
                      disabled={filtersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue
                            placeholder={t('upload_panel.tags_placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border z-50">
                        {filterEntities?.tags?.map((tag) => (
                          <SelectItem
                            key={tag.id}
                            value={tag.id.toString()}
                            className="hover:bg-accent"
                          >
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((tagId) => {
                        const tag = filterEntities?.tags?.find(
                          (t) => t.id === tagId
                        )
                        return (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag?.name}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((id) => id !== tagId)
                                )
                              }}
                            />
                          </Badge>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isUploading}
                >
                  {t('upload_panel.cancel_button')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isUploading || !selectedFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('upload_panel.upload_button')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  )
}
