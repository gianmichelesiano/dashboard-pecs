import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  IconButton,
  Text,
  Badge,
  Box,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";

import { CollectionService } from "../../client/services/CollectionService";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
import type { CollectionRead } from "../../client/types.gen";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";

interface DeleteCollectionProps {
  collection: CollectionRead;
}

const DeleteCollection = ({ collection }: DeleteCollectionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSuccessToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return await CollectionService.deleteCollection(collection.id);
    },
    onSuccess: () => {
      showSuccessToast(t("common.success", "Operazione completata con successo"));
      setIsOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["collections"] });
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
        <IconButton
          aria-label={t("collections.deleteCollection", "Elimina collezione")}
          size="sm"
          colorPalette="red"
          value="delete-collection"
        >
          <FiTrash2 />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("collections.deleteCollection", "Elimina Collezione")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {t("collections.deleteConfirmation", "Sei sicuro di voler eliminare questa collezione?")}
          </Text>
          <Text fontWeight="bold" mt={2}>
            {collection.name_custom || "Senza nome"}
          </Text>
          
          {collection.phrase_count && collection.phrase_count > 0 && (
            <Box mt={2}>
              <Badge colorPalette="red">
                {t("collections.phraseCountWarning", `Questa collezione contiene ${collection.phrase_count} frasi che verranno dissociate.`)}
              </Badge>
            </Box>
          )}
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

export default DeleteCollection;
