import React from "react";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

import type { CategoryPublic } from "@/client/types/category";
import DeleteCategory from "../Categories/DeleteCategory";
import EditCategory from "../Categories/EditCategory";
import AddPictogram from "../Pictograms/AddPictogram";

interface CategoryActionsMenuProps {
  category: CategoryPublic;
}

export const CategoryActionsMenu = ({ category }: CategoryActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditCategory category={category} />
        <AddPictogram categoryId={category.id} />
        <DeleteCategory id={category.id} />
      </MenuContent>
    </MenuRoot>
  );
};