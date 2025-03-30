import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

import { CollectionService } from "../../client/services/CollectionService";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import type { ApiError } from "../../client/core/ApiError";
import type { CollectionCreate } from "../../client/types.gen";
import useAuth from "../../hooks/useAuth";
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

const AddCollection = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [color, setColor] = React.useState("#3182CE"); // Default blue color
  
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSuccessToast } = useCustomToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: CollectionCreate) => {
      return await CollectionService.createCollection({ requestBody: data });
    },
    onSuccess: () => {
      showSuccessToast(t("common.success", "Operazione completata con successo"));
      setIsOpen(false);
      setName("");
      setIcon("");
      setColor("#3182CE");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const handleSubmit = () => {
    if (!name || !user) return;
    
    const collectionData: CollectionCreate = {
      user_id: user.id,
      is_custom: true,
      is_visible: true,
      name_custom: name,
      icon: icon || undefined,
      color: color || undefined,
      translations: [
        {
          language_code: "it",
          name: name
        }
      ]
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
        <Button my={4} value="add-collection">
          <FiPlus />
          <Text ml={2}>{t("collections.addCollection", "Aggiungi Collezione")}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("collections.addCollection", "Aggiungi Collezione")}</DialogTitle>
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

export default AddCollection;
