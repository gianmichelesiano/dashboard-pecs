// React è importato automaticamente con JSX
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { type PictogramCreate } from "@/client/types/pictogram";
import { PictogramService } from "@/client/services/PictogramService";
import type { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
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

interface AddPictogramProps {
  categoryId: string;
}

const AddPictogram = ({ categoryId }: AddPictogramProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PictogramCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      word: "",
      image_url: "",
      is_custom: true,
      category_ids: [categoryId],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PictogramCreate) =>
      PictogramService.createPictogram({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Pittogramma creato con successo.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pictograms"] });
    },
  });

  const onSubmit: SubmitHandler<PictogramCreate> = (data) => {
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
        <Button variant="ghost">
          <FaPlus fontSize="16px" />
          Aggiungi Pittogramma
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Aggiungi Pittogramma</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Inserisci i dettagli per aggiungere un nuovo pittogramma.</Text>
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
                    required: "La parola è obbligatoria.",
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
                    required: "L'URL dell'immagine è obbligatorio.",
                  })}
                  placeholder="URL Immagine"
                  type="text"
                />
              </Field>
            </VStack>
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
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Salva
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddPictogram;