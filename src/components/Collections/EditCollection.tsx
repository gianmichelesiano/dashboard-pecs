import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";

import { CollectionService } from "../../client/services/CollectionService";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
import type { CollectionRead, CollectionUpdate } from "../../client/types.gen";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface EditCollectionProps {
  collection: CollectionRead;
}

const EditCollection = ({ collection }: EditCollectionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState(collection.name_custom || "");
  const [icon, setIcon] = React.useState(collection.icon || "");
  const [color, setColor] = React.useState(collection.color || "#3182CE");
  
  // Update state when collection changes
  React.useEffect(() => {
    if (collection) {
      setName(collection.name_custom || "");
      setIcon(collection.icon || "");
      setColor(collection.color || "#3182CE");
    }
  }, [collection]);
  
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSuccessToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: async (data: CollectionUpdate) => {
      return await CollectionService.updateCollection(collection.id, data);
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

  const handleSubmit = () => {
    if (!name) return;
    
    const collectionData: CollectionUpdate = {
      name_custom: name,
      icon: icon || undefined,
      color: color || undefined,
      translations: collection.translations ? 
        collection.translations.map((t) => ({
          language_code: t.language_code,
          name: t.language_code === "it" ? name : t.name
        })) : 
        [{ language_code: "it", name: name }]
    };
    
    mutation.mutate(collectionData);
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
          aria-label={t("collections.editCollection", "Modifica collezione")}
          size="sm"
          value="edit-collection"
        >
          <FiEdit />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("collections.editCollection", "Modifica Collezione")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field mb={4} label={t("collections.name", "Nome")}>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t("collections.namePlaceholder", "Nome della collezione")}
            />
          </Field>
          <Field mb={4} label={t("collections.icon", "Icona (opzionale)")}>
            <Input 
              value={icon} 
              onChange={(e) => setIcon(e.target.value)} 
              placeholder={t("collections.iconPlaceholder", "URL dell'icona o nome icona")}
            />
          </Field>
          <Field mb={4} label={t("collections.color", "Colore (opzionale)")}>
            <Flex>
              <Input 
                type="color"
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                width="80px"
                mr={2}
              />
              <Input 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                placeholder="#RRGGBB"
              />
            </Flex>
          </Field>
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
            colorPalette="green"
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={!name}
          >
            {t("common.save", "Salva")}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditCollection;
