import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Text,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

import { PhraseService } from "../../client/services/PhraseService";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";

interface DeletePhraseProps {
  phraseId: string;
  phraseText: string;
}

const DeletePhrase = ({ phraseId, phraseText }: DeletePhraseProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSuccessToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return await PhraseService.deletePhrase(phraseId);
    },
    onSuccess: () => {
      showSuccessToast(t("common.success", "Operazione completata con successo"));
      setIsOpen(false);
      
      // Invalida le query
      queryClient.invalidateQueries({ queryKey: ["phrases"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <DialogRoot
      size="sm"
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          colorPalette="red" 
          variant="ghost"
          aria-label={t("phrases.deletePhrase", "Elimina Frase")}
        >
          <FaTrash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("phrases.deletePhrase", "Elimina Frase")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {t("phrases.deleteConfirmation", "Sei sicuro di voler eliminare questa frase?")}
          </Text>
          <Text fontWeight="bold" mt={2}>
            {phraseText}
          </Text>
        </DialogBody>

        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button
              variant="subtle"
              colorPalette="gray"
              disabled={mutation.isPending}
            >
              {t("common.cancel", "Annulla")}
            </Button>
          </DialogActionTrigger>
          <Button
            variant="solid"
            colorPalette="red"
            onClick={handleDelete}
            loading={mutation.isPending}
          >
            {t("common.delete", "Elimina")}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default DeletePhrase;
