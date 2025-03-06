// React è importato automaticamente con JSX
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

import { type CategoryPublic } from "@/client/types/category";
import { CategoryService } from "@/client/services/CategoryService";
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
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface EditCategoryProps {
  category: CategoryPublic;
}

interface CategoryUpdateForm {
  name: string;
  icon?: string;
  color: string;
  is_visible?: boolean;
}

const EditCategory = ({ category }: EditCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...category,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryUpdateForm) =>
      CategoryService.updateCategory({ id: category.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Categoria aggiornata con successo.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      // Invalida tutte le query relative alle categorie, incluse quelle con parametri di paginazione
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const onSubmit: SubmitHandler<CategoryUpdateForm> = async (data) => {
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
          <FaExchangeAlt fontSize="16px" />
          Modifica Categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifica Categoria</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Aggiorna i dettagli della categoria.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Nome"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Il nome è obbligatorio",
                  })}
                  placeholder="Nome"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.icon}
                errorText={errors.icon?.message}
                label="Icona"
              >
                <Input
                  id="icon"
                  {...register("icon")}
                  placeholder="Icona"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.color}
                errorText={errors.color?.message}
                label="Colore"
              >
                <Input
                  id="color"
                  {...register("color", {
                    required: "Il colore è obbligatorio",
                  })}
                  placeholder="Colore"
                  type="color"
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

export default EditCategory;