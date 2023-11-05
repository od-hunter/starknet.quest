import React, { useEffect, useState } from "react";
import ChipList from "../components/UI/ChipList";
import Divider from "../components/UI/Divider";
import RankCards from "../components/UI/RankCards";
import ChevronRight from "../public/icons/ChevronRightIcon.svg";
import ChevronLeft from "../public/icons/ChevronLeftIcon.svg";
import Image from "next/image";
import {
  fetchLeaderboardRankings,
  fetchLeaderboardToppers,
} from "../services/apiService";
import XpBadge from "../public/icons/xpBadge.svg";
import { calculatePercentile } from "../utils/numberService";
import { useDisplayName } from "../hooks/displayName.tsx";
import Avatar from "../components/UI/avatar";
import { minifyAddress } from "../utils/stringService";
import styles from "../styles/leaderboard.module.css";
import { useAccount } from "@starknet-react/core";
import LeaderboardSkeleton from "../components/skeletons/leaderboardSkeleton";

const Rankings = (props: {
  data: { address: string; xp: number; achievements: number }[];
  firstIndex: number;
}) => {
  const addNumberPadding = (num: number) => {
    return num > 9 ? num : `0${num}`;
  };
  const { data, firstIndex } = props;

  return (
    <div className="flex flex-col gap-4">
      {data?.map((item, index) => (
        <div
          key={index}
          className="flex w-full justify-between items-center py-6"
        >
          <div className="flex gap-6 justify-between" style={{ flex: 0.1 }}>
            <div className="flex flex-1 max-w-[22px] items-center">
              <p className="text-white text-center">
                {addNumberPadding(firstIndex + index)}
              </p>
            </div>
            <div className="flex flex-1 gap-6 items-center">
              <Avatar address={item.address} width="32" />
              <p className="text-white">{minifyAddress(item.address)}</p>
            </div>
          </div>
          <div
            className="flex w-full gap-6 items-center justify-end"
            style={{ flex: 0.9 }}
          >
            <Image src={XpBadge} priority />
            <p className="text-white text-center">{item.xp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Leaderboard({ rankingData, topperData }) {
  const [selected, setSelected] = useState("Last 7 Days");
  const [ranking, setRanking] = useState({});
  const [userPercentile, setUserPercentile] = useState(100);
  const [leaderboardToppers, setLeaderboardToppers] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { address: userAddress } = useAccount();
  const address =
    "2891693835017387080162738071681597230526351468278460603751969936261624040198";

  const handleChangeSelection = (title: string) => {
    setSelected(title);
  };

  useEffect(() => {
    const makeCall = async () => {
      setLoading(true);
      console.log("yay");
      const requestBody = {
        addr: address ? address : "",
        page_size: 10,
        shift: 0,
        start_timestamp: new Date().setDate(new Date().getDate() - 7),
        end_timestamp: new Date().getTime(),
      };

      const rankingData = await fetchLeaderboardRankings(requestBody);
      const topperData = await fetchLeaderboardToppers({
        addr: requestBody.addr,
      });

      setRanking(rankingData);
      setLeaderboardToppers({
        "Last 7 Days": topperData.weekly,
        "Last 30 Days": topperData.monthly,
        "All time": topperData.all_time,
      });
      setLoading(false);
    };

    makeCall();
  }, []);

  const getTimeRange = () => {
    switch (selected) {
      case "Last 7 Days":
        return {
          start_timestamp: new Date().setDate(new Date().getDate() - 7),
          end_timestamp: new Date().getTime(),
        };
      case "Last 30 Days":
        return {
          start_timestamp: new Date().setDate(new Date().getDate() - 30),
          end_timestamp: new Date().getTime(),
        };
      case "All time":
        return {
          start_timestamp: 0,
          end_timestamp: new Date().getTime(),
        };
      default:
        return {
          start_timestamp: new Date().setDate(new Date().getDate() - 7),
          end_timestamp: new Date().getTime(),
        };
    }
  };

  useEffect(() => {
    if (!address) return;
    const requestBody = {
      addr: address,
      page_size: rowsPerPage,
      shift: currentPage,
      ...getTimeRange(),
    };

    const fetchRankings = async () => {
      const rankingData = await fetchLeaderboardRankings(requestBody);
      setRanking(rankingData);
    };

    fetchRankings();
  }, [rowsPerPage, currentPage, selected]);

  const handlePagination = (type: string) => {
    if (type === "next") {
      setCurrentPage((prev) => prev + 1);
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    console.log({ leaderboardToppers });
    const res = calculatePercentile(
      leaderboardToppers[selected as keyof typeof leaderboardToppers]?.position,
      leaderboardToppers[selected as keyof typeof leaderboardToppers]?.length
    );
    setUserPercentile(res);
  }, [leaderboardToppers]);

  useEffect(() => {
    console.log({ loading });
  }, [loading]);

  return (
    <div className="p-6 md:p-32">
      {loading ? (
        <LeaderboardSkeleton />
      ) : (
        <div className="flex flex-col rounded-lg bg-gray-300 w-full gap-6 px-4 md:px-8 py-7">
          <>
            <div className="flex flex-col md:flex-row w-full justify-between items-center gap-6">
              <p className={styles.leaderboard_heading}>Leaderboard</p>
              <ChipList
                selected={selected}
                handleChangeSelection={handleChangeSelection}
                tags={["Last 7 Days", "Last 30 Days", "All time"]}
              />
              <p>hey</p>
            </div>
            {userPercentile ? (
              <div className={styles.percentile_text_container}>
                <p className={styles.percentile_text_normal}>
                  {address === userAddress ? "You are" : "He is"}
                </p>
                <span className={styles.percentile_text_green}>
                  &nbsp;better than {userPercentile}%&nbsp;
                </span>
                <p className={styles.percentile_text_normal}>
                  of the other players
                </p>
              </div>
            ) : null}
            <Divider />
            <Rankings
              firstIndex={ranking.first_elt_position}
              data={ranking.ranking}
            />
            <div className="w-full flex flex-row justify-between items-center">
              <div className="flex ">
                <p className="text-white">Rows per page {rowsPerPage}</p>
              </div>
              <div className="flex">
                <div className="flex flex-row gap-4">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      if (ranking.first_elt_position == 1) return;
                      handlePagination("less");
                    }}
                  >
                    <Image src={ChevronLeft} priority />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      if (
                        ranking.first_elt_position + ranking.ranking.length >=
                        topperData?.selected?.length
                      )
                        return;
                      handlePagination("next");
                    }}
                  >
                    <Image src={ChevronRight} priority />
                  </div>
                </div>
              </div>
            </div>

            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaderboardToppers
                ? leaderboardToppers[
                    selected as keyof typeof leaderboardToppers
                  ]?.best_users?.map((item, index) => (
                    <RankCards
                      position={index + 1}
                      key={index}
                      name={item.address}
                      experience={item.xp}
                      trophy={item.achievements}
                    />
                  ))
                : null}
            </div>
          </>
        </div>
      )}
    </div>
  );
}
