import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
  Box,
} from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FaExchangeAlt } from "react-icons/fa";

import { type CategoryPublic, type CategoryTranslation } from "@/client/types/category";
import { CategoryService } from "@/client/services/CategoryService";
import { TranslationsService } from "@/client/sdk.gen";
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
  translations: {
    it?: string;
    en?: string;
    fr?: string;
    de?: string;
    es?: string;
  };
}

const EditCategory = ({ category }: EditCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  // Fetch existing translations for the category
  const { data: translations, isLoading: isLoadingTranslations } = useQuery({
    queryKey: ["categoryTranslations", category.id],
    queryFn: () => TranslationsService.getCategoryTranslations({ categoryId: category.id }),
    enabled: isOpen, // Only fetch when dialog is open
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...category,
      translations: {
        it: "",
        en: "",
        fr: "",
        de: "",
        es: "",
      }
    },
  });

  // Set translation values when they are loaded
  useEffect(() => {
    if (translations) {
      // Initialize with empty strings
      const translationValues = {
        it: "",
        en: "",
        fr: "",
        de: "",
        es: "",
      };
      
      // Fill in with actual translations
      translations.forEach(translation => {
        const lang = translation.language_code as keyof typeof translationValues;
        if (lang in translationValues) {
          translationValues[lang] = translation.name;
        }
      });
      
      // Set form values
      setValue("translations", translationValues);
    }
  }, [translations, setValue]);

  // Mutation for updating translations
  const updateTranslationMutation = useMutation({
    mutationFn: ({ categoryId, languageCode, name }: { categoryId: string; languageCode: string; name: string }) => {
      return TranslationsService.updateCategoryTranslation({
        categoryId,
        languageCode,
        requestBody: {
          name
        }
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  // Mutation for adding translations
  const addTranslationMutation = useMutation({
    mutationFn: ({ categoryId, languageCode, name }: { categoryId: string; languageCode: string; name: string }) => {
      return TranslationsService.addCategoryTranslation({
        categoryId,
        requestBody: {
          language_code: languageCode,
          name
        }
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryUpdateForm) => {
      // First update the main category
      const response = await CategoryService.updateCategory({ 
        id: category.id, 
        requestBody: {
          name: data.name,
          icon: data.icon,
          color: data.color,
          is_visible: data.is_visible
        }
      });

      // Get existing translations to determine if we need to update or add
      const existingTranslations = translations || [];
      const existingLanguages = new Set(existingTranslations.map(t => t.language_code));
      
      // Process each translation
      const languages = ['it', 'en', 'fr', 'de', 'es'] as const;
      
      for (const lang of languages) {
        const translationValue = data.translations[lang];
        
        // Skip empty translations and the primary language (which is updated with the main category)
        if (!translationValue) continue;
        
        if (existingLanguages.has(lang)) {
          // Update existing translation
          await updateTranslationMutation.mutateAsync({
            categoryId: category.id,
            languageCode: lang,
            name: translationValue
          });
        } else {
          // Add new translation
          await addTranslationMutation.mutateAsync({
            categoryId: category.id,
            languageCode: lang,
            name: translationValue
          });
        }
      }
      
      return response;
    },
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
      queryClient.invalidateQueries({ queryKey: ["categoryTranslations"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesByLanguage"] });
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
                label="Nome Principale"
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
              
              {/* Translations Fields */}
              <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} w="100%">
                <Text fontWeight="medium" mb={3}>Traduzioni</Text>
                
                {/* Italian */}
                <Field
                  invalid={!!errors.translations?.it}
                  errorText={errors.translations?.it?.message}
                  label="Nome (IT)"
                >
                  <Input
                    {...register("translations.it")}
                    placeholder="Nome della categoria"
                    type="text"
                  />
                </Field>
                
                {/* English */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.en}
                  errorText={errors.translations?.en?.message}
                  label="Name (EN)"
                >
                  <Input
                    {...register("translations.en")}
                    placeholder="Category name"
                    type="text"
                  />
                </Field>
                
                {/* French */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.fr}
                  errorText={errors.translations?.fr?.message}
                  label="Nom (FR)"
                >
                  <Input
                    {...register("translations.fr")}
                    placeholder="Nom de la catégorie"
                    type="text"
                  />
                </Field>
                
                {/* German */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.de}
                  errorText={errors.translations?.de?.message}
                  label="Name (DE)"
                >
                  <Input
                    {...register("translations.de")}
                    placeholder="Kategoriename"
                    type="text"
                  />
                </Field>
                
                {/* Spanish */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.es}
                  errorText={errors.translations?.es?.message}
                  label="Nombre (ES)"
                >
                  <Input
                    {...register("translations.es")}
                    placeholder="Nombre de la categoría"
                    type="text"
                  />
                </Field>
              </Box>
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
