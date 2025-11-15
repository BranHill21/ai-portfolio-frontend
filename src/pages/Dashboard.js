import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import API from "../api";
import { useQuery } from "@tanstack/react-query";

const Dashboard = ({ user }) => {
  // Fetch function used by React Query
  const fetchAssets = async () => {
    const res = await API.get(`/api/assets/${user.id}`);
    return res.data;
  };

  // React Query call
  const {
    data: assets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assets", user?.id],  // unique cache key per user
    queryFn: fetchAssets,
    enabled: !!user?.id,             // ONLY fetch when user.id exists
    staleTime: 1000 * 60 * 5,        // cache fresh for 5 minutes
    refetchOnWindowFocus: false,     // optional (prevents refetching on tab switch)
  });

  if (!user) return <p>Please log in to view your dashboard.</p>;
  if (isLoading) return <p>Loading your assets...</p>;
  if (isError) return <p>Failed to load assets.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard</h1>

      <p>Hello, <strong>{user.username}</strong></p>
      <p>Here are your personalized insights and portfolio details.</p>

      {assets.length > 0 ? (
        <div>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.symbol}</td>
                  <td>{asset.quantity}</td>
                  <td>${asset.buyPrice}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id="dropdown-basic">
                        Manage
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item>Update Quantity</Dropdown.Item>
                        <Dropdown.Item>Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No assets found for this user.</p>
      )}
    </div>
  );
};

export default Dashboard;