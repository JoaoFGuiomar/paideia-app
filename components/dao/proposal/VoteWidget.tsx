import { FC, useContext, useState, useEffect } from "react";
import { CapsInfo } from "@components/creation/utilities/HeaderComponents";
import { Avatar, Box, Button, LinearProgress, LinearProgressProps, Typography } from "@mui/material";
import { VoteWidget } from "../proposals/ProposalCard";
import dateFormat from "dateformat";
import { useRouter } from "next/router";
import Link from "next/link";
import { deviceWrapper } from "@components/utilities/Style";
import { getRandomImage } from "@components/utilities/images";
import Warning from "@components/utilities/Warning";
import { GlobalContext, IGlobalContext } from "@lib/AppContext";
import { fetcher } from "@lib/utilities";
import useSWR from "swr";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface IVoteWidgetProps {
  yes?: number;
  no?: number;
}

interface ILastVote {
  img: string;
  name: string;
  date: Date;
  vote: number;
}

export const niceNumber = (number: number) => {
  return Number(number.toFixed(0)).toLocaleString()
}

const LastVotes: React.FC = () => {
  const lastVotes: ILastVote[] = [
    { img: "", name: "John Daonnot", date: new Date(), vote: 1 },
    { img: "", name: "Lily Evans", date: new Date(), vote: 1 },
    { img: "", name: "Michael Mirandi", date: new Date(), vote: 0 },
    { img: "", name: "Jaoquin Cizzin", date: new Date(), vote: 1 },
  ];
  return (
    <>
      {lastVotes.slice(0, 3).map((i: ILastVote, c: number) => {
        return (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              mb: ".5rem",
            }}
            key={`last-vote-${c}`}
          >
            <Avatar
              // src={`https://picsum.photos/300/200/?random=${c}`}
              src={getRandomImage()}
            />
            <Box sx={{ ml: ".5rem" }}>
              {i.name}
              <Box sx={{ fontSize: ".9rem", color: "text.secondary" }}>
                {dateFormat(i.date, "mmmm dS, yyyy @ hh:mm")}
              </Box>
            </Box>
            <Box
              sx={{
                ml: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: ".2rem",
                pl: ".5rem",
                pr: ".5rem",
                backgroundColor: i.vote === 1 ? "success.light" : "error.light",
                color: i.vote === 1 ? "black" : "white",
                borderRadius: "1rem",
                fontSize: ".8rem",
              }}
            >
              {i.vote === 1 ? "YES" : "NO"}
            </Box>
          </Box>
        );
      })}
    </>
  );
};

const _VoteWidget: React.FC<IVoteWidgetProps> = (props) => {
  const context = useContext<IGlobalContext>(GlobalContext);
  const governance = context.api.daoData?.governance;
  const daoId = context.api.daoData?.id;
  const router = useRouter();
  const { dao, proposal_id } = router.query;

  const { data: stakingData, error: error } = useSWR(
    daoId && `/staking/dao_stake_info/${daoId}`,
    fetcher
  );

  // const quorumInfo = `For this proposal to be approved a quorum of 
  // ${governance?.quorum / 10}% and ${governance?.support_needed / 10}% 
  // support is needed.`;

  const quorumNumberNeeded = ((stakingData?.total_staked * governance?.quorum) / 1000)
  const current = (props.yes + props.no)
  const quorumPct = (governance?.quorum / 10)
  const percentValue = ((current) / quorumNumberNeeded * 100)
  const supportMet = (props.yes / current * 100) >= (governance?.support_needed / 10)
  // const quorumDetails = `Aleast ${numberNeeded.toFixed(0).toLocaleString()} votes needed to meet ${governance?.quorum / 10}% 
  // quorum with the current number of DAO tokens staked.`;

  return (
    <>
      <Box
        sx={{
          backgroundColor: "fileInput.outer",
          border: deviceWrapper("0", "1px solid"),
          borderColor: deviceWrapper("none", "border.main"),
          borderRadius: ".3rem",
          width: deviceWrapper("calc(100% + 1.5rem)", "100%"),
          mb: "1rem",
          ml: deviceWrapper("-.75rem", "0"),
        }}
      >
        <Box
          sx={{
            width: "100%",
            borderBottom: deviceWrapper("0", "1px solid"),
            borderBottomColor: deviceWrapper("none", "border.main"),
            p: ".5rem",
          }}
        >
          <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
            <CapsInfo
              title={`Votes: ${niceNumber((props.no ?? 0) + (props.yes ?? 0))}`}
              mb={"0.5rem"}
            />
            <Button
              sx={{
                display: deviceWrapper("flex", "none"),
                ml: "auto",
                whiteSpace: "no-wrap",
                minWidth: "max-content",
              }}
              size="small"
            >
              View All
            </Button>
          </Box>
          <VoteWidget yes={props.yes ?? 0} no={props.no ?? 0} />
        </Box>
        {/* <Box
        sx={{
          width: "100%",
          borderBottom: deviceWrapper("0", "1px solid"),
          borderBottomColor: deviceWrapper("none", "border.main"),
          p: ".5rem",
          display: deviceWrapper("none", "block"),
        }}
      >
        <CapsInfo title="Last Votes" mb={"0"} />
        <LastVotes />
      </Box> */}
        <Box
          sx={{
            width: "100%",
            display: deviceWrapper("none", "flex"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link
            href={
              dao === undefined ? `` : `/${dao}/proposal/${proposal_id}/votes`
            }
          >
            <Button
              disabled
              size="small"
              sx={{
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                width: "100%",
              }}
            >
              View All Votes
            </Button>
          </Link>
        </Box>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center' }}>
          {supportMet ? <CheckIcon /> : <CloseIcon />}
          <Typography sx={{ fontSize: '14px' }}>
            {governance?.support_needed / 10}% support {supportMet ? 'met' : 'required'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Box>
          {percentValue > 100
            ? <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center' }}>
              <CheckIcon />
              <Typography sx={{ fontSize: '14px' }}>Quorum achieved</Typography>
            </Box>
            :
            <Box sx={{ display: 'flex', direction: 'row', alignItems: 'center' }}>
              <CloseIcon />
              <Typography sx={{ fontSize: '14px' }}>
                {niceNumber(quorumNumberNeeded - current)} more votes required to meet {quorumPct.toFixed(0)}% quorum
              </Typography>
            </Box>
          }
        </Box>
      </Box>
      {/* <Warning title="Quorum and Support Details" subtitle={quorumInfo} /> */}
      {/* <Warning title="Quorum Requirement" subtitle={quorumDetails} /> */}
    </>
  );
};

export default _VoteWidget;
