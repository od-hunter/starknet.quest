import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";

const SocialMediaActions: FunctionComponent<SocialMediaActions> = ({
  tokenId,
  isOwner,
  domain = "",
}) => {
  return (
    <div className="flex flex-row gap-1">
      <ClickableTwitterIcon
        isOwner={isOwner}
        width="25"
        tokenId={tokenId}
        domain={domain}
      />
      <ClickableDiscordIcon
        isOwner={isOwner}
        width="25"
        tokenId={tokenId}
        domain={domain}
      />
      <ClickableGithubIcon
        isOwner={isOwner}
        width="25"
        tokenId={tokenId}
        domain={domain}
      />
    </div>
  );
};

export default SocialMediaActions;