import React from "react";
import { Button, DialogTitle, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";

import { PictogramService } from "../../client/services/PictogramService";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import useCustomToast from "../../hooks/useCustomToast";

const DeletePictogram = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deletePictogram = async (id: string) => {
    await PictogramService.deletePictogram({ id: id });
  };

  const mutation = useMutation({
    mutationFn: deletePictogram,
    onSuccess: () => {
      showSuccessToast("Il pittogramma è stato eliminato con successo");
      setIsOpen(false);
    },
    onError: () => {
      showErrorToast("Si è verificato un errore durante l'eliminazione del pittogramma");
    },
    onSettled: () => {
      // Invalida tutte le query relative ai pittogrammi, incluse quelle con parametri di paginazione
      queryClient.invalidateQueries({ queryKey: ["pictograms"] });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
  };

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
          Elimina
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Elimina Pittogramma</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Questo pittogramma verrà eliminato definitivamente. Sei sicuro? Non potrai annullare questa azione.
            </Text>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Annulla
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              colorPalette="red"
              type="submit"
              loading={isSubmitting}
            >
              Elimina
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};

export default DeletePictogram;