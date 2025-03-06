import React from "react";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

import type { PictogramPublic } from "../../client/types/pictogram";
import DeletePictogram from "../Pictograms/DeletePictogram";
import EditPictogram from "../Pictograms/EditPictogram";

interface PictogramActionsMenuProps {
  pictogram: PictogramPublic;
}

export const PictogramActionsMenu = ({ pictogram }: PictogramActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditPictogram pictogram={pictogram} />
        <DeletePictogram id={pictogram.id} />
      </MenuContent>
    </MenuRoot>
  );
};