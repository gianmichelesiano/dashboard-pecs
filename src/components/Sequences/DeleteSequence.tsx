import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

import { SequenceService } from "../../client/services/SequenceService";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import useCustomToast from "../../hooks/useCustomToast";

const DeleteSequence = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const deleteSequence = async (id: string) => {
    await SequenceService.deleteSequence({ id });
  };

  const mutation = useMutation({
    mutationFn: deleteSequence,
    onSuccess: () => {
      showSuccessToast("La sequenza è stata eliminata con successo");
      setIsOpen(false);
    },
    onError: () => {
      showErrorToast("Si è verificato un errore durante l'eliminazione della sequenza");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
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
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Elimina Sequenza</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text mb={4}>
            Questa sequenza verrà eliminata definitivamente. Sei sicuro? Non potrai annullare questa azione.
          </Text>
        </DialogBody>

        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button
              variant="subtle"
              colorPalette="gray"
              disabled={mutation.isPending}
            >
              Annulla
            </Button>
          </DialogActionTrigger>
          <Button
            variant="solid"
            colorPalette="red"
            onClick={onSubmit}
            loading={mutation.isPending}
          >
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteSequence;