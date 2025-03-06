import React from "react";
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaExchangeAlt } from "react-icons/fa";

import { type PictogramPublic } from "../../client/types/pictogram";
import { PictogramService } from "../../client/services/PictogramService";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface EditPictogramProps {
  pictogram: PictogramPublic;
}

interface PictogramUpdateForm {
  word: string;
  image_url: string;
  is_custom?: boolean;
}

const EditPictogram = ({ pictogram }: EditPictogramProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PictogramUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      word: pictogram.word,
      image_url: pictogram.image_url,
      is_custom: pictogram.is_custom,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PictogramUpdateForm) =>
      PictogramService.updatePictogram({ 
        id: pictogram.id, 
        requestBody: {
          ...data,
          category_ids: pictogram.category_ids // Mantieni le stesse categorie
        }
      }),
    onSuccess: () => {
      showSuccessToast("Pittogramma aggiornato con successo.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      // Invalida tutte le query relative ai pittogrammi, incluse quelle con parametri di paginazione
      queryClient.invalidateQueries({ queryKey: ["pictograms"] });
    },
  });

  const onSubmit: SubmitHandler<PictogramUpdateForm> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FaExchangeAlt fontSize="16px" />
          Modifica
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifica Pittogramma</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Aggiorna i dettagli del pittogramma.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.word}
                errorText={errors.word?.message}
                label="Parola"
              >
                <Input
                  id="word"
                  {...register("word", {
                    required: "La parola è obbligatoria",
                  })}
                  placeholder="Parola"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.image_url}
                errorText={errors.image_url?.message}
                label="URL Immagine"
              >
                <Input
                  id="image_url"
                  {...register("image_url", {
                    required: "L'URL dell'immagine è obbligatorio",
                  })}
                  placeholder="URL Immagine"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Annulla
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Salva
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditPictogram;