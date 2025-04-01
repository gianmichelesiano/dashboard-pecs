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

import { type SequenceGroupCreate } from "@/client/types/sequence";
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
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

const AddSequenceGroup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SequenceGroupCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      icon: "",
      color: "#000000",
      display_order: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SequenceGroupCreate) =>
      SequenceService.createSequenceGroup({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Gruppo di sequenze creato con successo.");
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

  const onSubmit: SubmitHandler<SequenceGroupCreate> = (data) => {
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
        <Button variant="ghost" value="add-sequence-group" my={4}>
          <FaPlus fontSize="16px" />
          Aggiungi Gruppo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Aggiungi Gruppo di Sequenze</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Inserisci i dettagli per aggiungere un nuovo gruppo di sequenze.</Text>
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
                    required: "Il nome è obbligatorio.",
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
                    required: "Il colore è obbligatorio.",
                  })}
                  placeholder="Colore"
                  type="color"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="ghost"
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

export default AddSequenceGroup;
