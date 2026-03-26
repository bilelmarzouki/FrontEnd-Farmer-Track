import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, TextField, MenuItem } from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { Cow } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const Dashboard: React.FC = () => {
  const [allCows, setAllCows] = useState<Cow[]>([]);
  const [breedCows, setBreedCows] = useState<Cow[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('Holstein');
  const [breeds, setBreeds] = useState<string[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [monthlySummary, setMonthlySummary] = useState<{ period: string; count: number; totalExpensesInThisMonth: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, expRes] = await Promise.all([
          fetch(`${API_URL}/cow/get-all-cows`),
          fetch(`${API_URL}/expense/get-all-expenses`),
        ]);

        const allJson = await allRes.json();
        const expJson = await expRes.json();

        const cows = allJson.cows || [];
        setAllCows(cows);
        setTotalExpenses(expJson.totalExpenses ?? 0);

        // Extract unique breeds
        const uniqueBreeds: any = [...new Set(cows.map(cow => cow.breed))].sort();
        setBreeds(uniqueBreeds);

        // Set default breed if Holstein exists, else first breed
        const defaultBreed: any = uniqueBreeds.includes('Holstein') ? 'Holstein' : uniqueBreeds[0] || '';
        setSelectedBreed(defaultBreed);

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;

        const monthRes = await fetch(`${API_URL}/expense/monthly-summary/${y}/${m}`);
        const monthJson = await monthRes.json();
        setMonthlySummary(monthJson);
      } catch (error) {
        console.error('Dashboard load error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBreed) {
      fetch(`${API_URL}/cow/get-cows-by-breed/${selectedBreed}`)
        .then(res => res.json())
        .then(data => setBreedCows(data.cows || []))
        .catch(err => console.error('Breed fetch error', err));
    }
  }, [selectedBreed]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>🐄 Farm Dashboard</Typography>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography>Select Breed:</Typography>
        <TextField
          select
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {breeds.map((breed) => (
            <MenuItem key={breed} value={breed}>
              {breed}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Cows in Farm</Typography>
              <Typography variant="h4">{allCows.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">{selectedBreed} Cows</Typography>
              <Typography variant="h4">{breedCows.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Total Expenses</Typography>
              <Typography variant="h4">{totalExpenses.toFixed(2)} TND</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Monthly Summary</Typography>
              <Typography variant="h5">{monthlySummary?.period || '-'}</Typography>
              <Typography>{monthlySummary ? `${monthlySummary.count} expenses, ${monthlySummary.totalExpensesInThisMonth.toFixed(2)} TND` : 'No data'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

