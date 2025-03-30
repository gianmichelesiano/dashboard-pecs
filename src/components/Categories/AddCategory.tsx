import { useMutation, useQueryClient, useQuery, useQueries } from "@tanstack/react-query";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Box,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import { type CategoryCreate, type CategoryPublic, type CategoryUpdate, type CategoryTranslation } from "@/client/types/category";
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
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import { Radio, RadioGroup } from "../ui/radio";
import { Checkbox } from "../ui/checkbox";

// Define the form data structure with translations
interface CategoryFormData {
  icon: string;
  color: string;
  is_visible: boolean;
  translations: {
    it?: string;
    en?: string;
    fr?: string;
    de?: string;
    es?: string;
  };
}

const AddCategory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { showSuccessToast } = useCustomToast();
  
  // Get all categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.readCategories(),
    enabled: isOpen, // Only fetch when dialog is open
  });
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CategoryFormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      icon: "",
      color: "#000000",
      is_visible: true,
      translations: {
        it: "",
        en: "",
        fr: "",
        de: "",
        es: "",
      }
    },
  });

  // Mutation for adding translations to a category
  const addTranslationMutation = useMutation({
    mutationFn: ({ categoryId, languageCode, name }: { categoryId: string; languageCode: string; name: string }) => {
      return TranslationsService.addCategoryTranslation({
        categoryId,
        requestBody: {
          language_code: languageCode,
          name: name
        }
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Find the first non-empty translation to use as the primary name
      let name = '';
      let lang = '';
      const languages = ['it', 'en', 'fr', 'de', 'es'] as const;
      
      // First try to use the current language
      const currentLang = i18n.language as keyof typeof data.translations;
      if (data.translations[currentLang]) {
        name = data.translations[currentLang] || '';
        lang = currentLang;
      } else {
        // If current language is empty, find the first non-empty translation
        for (const language of languages) {
          if (data.translations[language]) {
            name = data.translations[language] || '';
            lang = language;
            break;
          }
        }
      }
      
      // If no translation is provided, use a default name
      if (!name) {
        name = 'New Category';
        lang = 'en'; // Default to English
      }
      
      // Create the base category with the name and language
      const categoryData: CategoryCreate = {
        name,
        icon: data.icon,
        color: data.color,
        is_custom: true,
        is_visible: data.is_visible,
        lang // Include the language code
      };
      
      // Create the category with the primary language
      const response = await CategoryService.createCategory({ 
        requestBody: categoryData
      });
      
      // Store the translations that need to be added (excluding the primary language)
      const translationsToAdd: { languageCode: string; name: string }[] = [];
      
      // Add all non-empty translations except the primary one
      for (const language of languages) {
        if (language !== lang && data.translations[language]) {
          translationsToAdd.push({
            languageCode: language,
            name: data.translations[language] || ''
          });
        }
      }
      
      // Add all translations
      for (const translation of translationsToAdd) {
        await addTranslationMutation.mutateAsync({
          categoryId: response.id,
          languageCode: translation.languageCode,
          name: translation.name
        });
      }
      
      return response;
    },
    onSuccess: (response) => {
      showSuccessToast(t("common.success"));
      reset();
      setIsOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesByLanguage"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
    }
  });

  const onSubmit: SubmitHandler<CategoryFormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: "sm", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-category" my={4}>
          <FaPlus fontSize="16px" />
          {t("common.add")} {t("categories.category")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("categories.addCategory")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("categories.addCategoryDescription")}</Text>
            <VStack gap={4} align="stretch">
              {/* Icon and Color */}
              <Flex gap={4}>
                <Box flex="1">
                  <Field
                    invalid={!!errors.icon}
                    errorText={errors.icon?.message}
                    label={t("categories.icon")}
                  >
                    <Input
                      id="icon"
                      {...register("icon")}
                      placeholder={t("categories.iconPlaceholder")}
                      type="text"
                    />
                  </Field>
                </Box>
                <Box flex="1">
                  <Field
                    required
                    invalid={!!errors.color}
                    errorText={errors.color?.message}
                    label={t("categories.color")}
                  >
                    <Input
                      id="color"
                      {...register("color", {
                        required: t("categories.colorRequired"),
                      })}
                      type="color"
                    />
                  </Field>
                </Box>
              </Flex>

              {/* Translations Fields */}
              <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <Text fontWeight="medium" mb={3}>{t("categories.translations") || "Traduzioni"}</Text>
                
                {/* Italian */}
                <Field
                  invalid={!!errors.translations?.it}
                  errorText={errors.translations?.it?.message}
                  label={t("categories.nameIt") || "Nome (IT)"}
                >
                  <Input
                    {...register("translations.it")}
                    placeholder={t("categories.namePlaceholder") || "Nome della categoria"}
                    type="text"
                  />
                </Field>
                
                {/* English */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.en}
                  errorText={errors.translations?.en?.message}
                  label={t("categories.nameEn") || "Name (EN)"}
                >
                  <Input
                    {...register("translations.en")}
                    placeholder={t("categories.namePlaceholder") || "Category name"}
                    type="text"
                  />
                </Field>
                
                {/* French */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.fr}
                  errorText={errors.translations?.fr?.message}
                  label={t("categories.nameFr") || "Nom (FR)"}
                >
                  <Input
                    {...register("translations.fr")}
                    placeholder={t("categories.namePlaceholder") || "Nom de la catégorie"}
                    type="text"
                  />
                </Field>
                
                {/* German */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.de}
                  errorText={errors.translations?.de?.message}
                  label={t("categories.nameDe") || "Name (DE)"}
                >
                  <Input
                    {...register("translations.de")}
                    placeholder={t("categories.namePlaceholder") || "Kategoriename"}
                    type="text"
                  />
                </Field>
                
                {/* Spanish */}
                <Field
                  mt={3}
                  invalid={!!errors.translations?.es}
                  errorText={errors.translations?.es?.message}
                  label={t("categories.nameEs") || "Nombre (ES)"}
                >
                  <Input
                    {...register("translations.es")}
                    placeholder={t("categories.namePlaceholder") || "Nombre de la categoría"}
                    type="text"
                  />
                </Field>
              </Box>

              {/* Visibility */}
              <Field>
                <Controller
                  name="is_visible"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    >
                      {t("categories.visible")}
                    </Checkbox>
                  )}
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
                {t("common.cancel")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddCategory;
