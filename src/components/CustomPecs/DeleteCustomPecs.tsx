import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, DialogTitle, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"

import { PecsService, ImagesService } from "../../client/sdk.gen"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import useCustomToast from "../../hooks/useCustomToast"

const DeleteCustomPecs = ({ id }: { id: string }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const deletePecs = async (id: string) => {
    try {
      // Prima otteniamo i dettagli del PECS per ottenere l'URL dell'immagine
      const pecsDetails = await PecsService.getPecs({ pecsId: id })
      
      // Eliminiamo il PECS
      await PecsService.deletePecs({ pecsId: id })
      
      // Estraiamo il nome del file dall'URL dell'immagine
      const imageUrl = pecsDetails.image_url
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
      
      // Se l'URL contiene un parametro di query, lo rimuoviamo
      const cleanFilename = filename.split('?')[0]
      
      // Eliminiamo l'immagine
      await ImagesService.deleteImage({ filename: cleanFilename })
      
      return { success: true }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error)
      throw error
    }
  }

  const mutation = useMutation({
    mutationFn: deletePecs,
    onSuccess: () => {
      showSuccessToast(t("customPecs.deleteSuccess"))
      setIsOpen(false)
    },
    onError: () => {
      showErrorToast(t("customPecs.deleteError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pecs"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate(id)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      role="alertdialog"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 fontSize="16px" />
          {t("customPecs.delete")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{t("customPecs.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              {t("customPecs.deleteConfirmation")}
            </Text>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                {t("customPecs.cancel")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              colorPalette="red"
              type="submit"
              loading={isSubmitting}
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteCustomPecs
