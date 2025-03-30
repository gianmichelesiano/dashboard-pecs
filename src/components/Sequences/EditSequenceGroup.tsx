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

import { type SequenceGroupRead } from "@/client/types/sequence";
import { SequenceService } from "@/client/services/SequenceService";
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

interface EditSequenceGroupProps {
  group: SequenceGroupRead;
}

interface SequenceGroupUpdateForm {
  name?: string;
  icon?: string | null;
  color?: string;
  display_order?: number;
}

const EditSequenceGroup = ({ group }: EditSequenceGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SequenceGroupUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...group,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SequenceGroupUpdateForm) =>
      SequenceService.updateSequenceGroup({ id: group.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Gruppo di sequenze aggiornato con successo.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sequenceGroups"] });
    },
  });

  const onSubmit: SubmitHandler<SequenceGroupUpdateForm> = async (data) => {
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
          Modifica Gruppo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Modifica Gruppo di Sequenze</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Aggiorna i dettagli del gruppo di sequenze.</Text>
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

export default EditSequenceGroup;
