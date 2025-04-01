import React from "react";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

import type { SequenceGroupRead } from "@/client/types/sequence";
import DeleteSequenceGroup from "../Sequences/DeleteSequenceGroup";
import EditSequenceGroup from "../Sequences/EditSequenceGroup";

interface SequenceGroupActionsMenuProps {
  group: SequenceGroupRead;
}

export const SequenceGroupActionsMenu = ({ group }: SequenceGroupActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditSequenceGroup group={group} />
        <DeleteSequenceGroup id={group.id} />
      </MenuContent>
    </MenuRoot>
  );
};
