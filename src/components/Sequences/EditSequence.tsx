import React from "react";
import { Button, Text, Input } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit } from "react-icons/fi";

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
import { Field } from "../../components/ui/field";
import useCustomToast from "../../hooks/useCustomToast";

interface EditSequenceProps {
  id: string;
  name: string;
}

const EditSequence = ({ id, name }: EditSequenceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: name,
    },
  });

  const updateSequence = async (data: { name: string }) => {
    await SequenceService.updateSequence({
      id,
      requestBody: {
        name: data.name,
      },
    });
  };

  const mutation = useMutation({
    mutationFn: updateSequence,
    onSuccess: () => {
      showSuccessToast("La sequenza è stata aggiornata con successo");
      setIsOpen(false);
    },
    onError: () => {
      showErrorToast("Si è verificato un errore durante l'aggiornamento della sequenza");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
    },
  });

  const onSubmit = async (data: { name: string }) => {
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
          <FiEdit fontSize="16px" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Modifica Sequenza</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Modifica i dettagli della sequenza.</Text>
            <Field
              required
              invalid={!!errors.name}
              errorText={errors.name?.message}
              label="Nome"
            >
              <Input
                id="name"
                {...register("name", {
                  required: "Il nome è obbligatorio.",
                })}
                placeholder="Nome"
                type="text"
              />
            </Field>
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
      </DialogContent>
    </DialogRoot>
  );
};

export default EditSequence;