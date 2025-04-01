import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Image,
  Box,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiPlus } from "react-icons/fi"

import { PecsService, ImagesService } from "../../client/sdk.gen"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface PecsCreateForm {
  name_custom: string
  image_url: string
  file?: File
}

const DEFAULT_CATEGORY_ID = "2191e187-9ae6-453e-a3cc-db0abb993b86"

const AddCustomPecs = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PecsCreateForm>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name_custom: "",
      image_url: "",
    },
  })

  const currentImageUrl = watch("image_url")

  const mutation = useMutation({
    mutationFn: (data: PecsCreateForm) =>
      PecsService.createPecs({
        requestBody: {
          name_custom: data.name_custom,
          image_url: data.image_url,
          is_custom: true,
          category_ids: [DEFAULT_CATEGORY_ID],
        },
      }),
    onSuccess: () => {
      showSuccessToast(t("customPecs.createSuccess"))
      reset()
      setIsOpen(false)
    },
    onError: (err: any) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pecs"] })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Salviamo il file selezionato nel form senza caricarlo
    setValue("file", files[0])
    
    // Mostriamo un'anteprima dell'immagine selezionata
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      if (event.target?.result) {
        // Impostiamo temporaneamente l'URL dell'immagine per la preview
        setValue("image_url", event.target.result as string, { shouldValidate: true })
        trigger("image_url")
      }
    }
    fileReader.readAsDataURL(files[0])
  }

  const onSubmit: SubmitHandler<PecsCreateForm> = async (data) => {
    console.log("Form data:", data)
    
    // Se c'è un file da caricare, lo facciamo prima di inviare il form
    if (data.file) {
      setIsUploading(true)
      try {
        // Carichiamo il file
        const response = await ImagesService.uploadImage({
          formData: {
            file: data.file
          },
        })

        // Utilizziamo any per evitare problemi di tipo con la risposta
        const responseData = response as any
        if (responseData.success && responseData.url) {
          // Aggiorniamo l'URL dell'immagine con quello restituito dal server
          data.image_url = responseData.url
          showSuccessToast(t("customPecs.uploadSuccess"))
        }
      } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error)
        setIsUploading(false)
        return // Interrompiamo la sottomissione del form in caso di errore
      } finally {
        setIsUploading(false)
      }
    }
    
    // Ora inviamo i dati del form con l'URL dell'immagine aggiornato
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-custom-pecs" my={4}>
          <FiPlus fontSize="16px" />
          {t("customPecs.add")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("customPecs.addTitle")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("customPecs.addDescription")}</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name_custom}
                errorText={errors.name_custom?.message}
                label={t("customPecs.customName")}
              >
                <Input
                  id="name_custom"
                  {...register("name_custom", {
                    required: t("customPecs.customNameRequired"),
                  })}
                  placeholder={t("customPecs.customNamePlaceholder")}
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.image_url}
                errorText={errors.image_url?.message}
                label={t("customPecs.image")}
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Input
                  type="hidden"
                  {...register("image_url", {
                    required: t("customPecs.imageRequired"),
                  })}
                />
                {currentImageUrl && (
                  <Box mt={2}>
                    <Text fontSize="sm" mb={1}>
                      {t("customPecs.preview")} - {t("customPecs.willUploadOnSave")}
                    </Text>
                    <Image
                      src={currentImageUrl}
                      alt={t("customPecs.preview")}
                      boxSize="100px"
                      objectFit="contain"
                    />
                  </Box>
                )}
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting || isUploading}
              >
                {t("customPecs.cancel")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid || isUploading}
              loading={isSubmitting || isUploading}
            >
              {t("customPecs.save")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddCustomPecs
