import React, { useState } from "react"
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
  Image,
  Box,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import { PecsService, ImagesService } from "../../client/sdk.gen"
import type { PecsPublic } from "../../client/types/pecs"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditCustomPecsProps {
  pecs: PecsPublic
}

interface PecsUpdateForm {
  name_custom: string
  image_url: string
  file?: FileList
}

const EditCustomPecs = ({ pecs }: EditCustomPecsProps) => {
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
    formState: { errors, isSubmitting },
  } = useForm<PecsUpdateForm>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name_custom: pecs.name_custom || "",
      image_url: pecs.image_url,
    },
  })

  const currentImageUrl = watch("image_url")

  const mutation = useMutation({
    mutationFn: (data: PecsUpdateForm) =>
      PecsService.updatePecs({
        pecsId: pecs.id,
        requestBody: {
          name_custom: data.name_custom,
          image_url: data.image_url,
          is_custom: true,
        },
      }),
    onSuccess: () => {
      showSuccessToast("PECS aggiornata con successo.")
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      // Inviamo direttamente il file invece di usare FormData
      const response = await ImagesService.uploadImage({
        formData: {
          file: files[0]
        },
      })

      // Utilizziamo any per evitare problemi di tipo con la risposta
      const responseData = response as any
      if (responseData.success && responseData.url) {
        setValue("image_url", responseData.url, { shouldValidate: true })
        // Forziamo la validazione del campo image_url
        await trigger("image_url")
        showSuccessToast("Immagine caricata con successo")
      }
    } catch (error) {
      console.error("Errore durante il caricamento dell'immagine:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit: SubmitHandler<PecsUpdateForm> = async (data) => {
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
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Modifica PECS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifica PECS</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Aggiorna i dettagli della PECS personalizzata.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name_custom}
                errorText={errors.name_custom?.message}
                label="Nome personalizzato"
              >
                <Input
                  id="name_custom"
                  {...register("name_custom", {
                    required: "Il nome personalizzato è obbligatorio",
                  })}
                  placeholder="Nome personalizzato"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.image_url}
                errorText={errors.image_url?.message}
                label="Immagine"
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
                    required: "L'immagine è obbligatoria",
                  })}
                />
                {currentImageUrl && (
                  <Box mt={2}>
                    <Image
                      src={currentImageUrl}
                      alt="Anteprima"
                      boxSize="100px"
                      objectFit="contain"
                    />
                  </Box>
                )}
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting || isUploading}
                >
                  Annulla
                </Button>
              </DialogActionTrigger>
              <Button
                variant="solid"
                type="submit"
                loading={isSubmitting || isUploading}
                disabled={isUploading}
              >
                Salva
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditCustomPecs
