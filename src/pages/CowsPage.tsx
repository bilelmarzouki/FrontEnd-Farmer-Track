import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper, FormControlLabel, Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const CowsPage: React.FC = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breedFilter, setBreedFilter] = useState('');
  const [editCow, setEditCow] = useState<any>(null);

  const fetchCows = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/cow/get-all-cows`);
      setCows(data.cows || []);
    } catch (err) {
      console.error(err);
      alert('Could not fetch cows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCows(); }, []);

  const handleDeleteCow = async (id: string) => {
    if (!window.confirm('Delete this cow?')) return;
    await axios.delete(`${API_URL}/cow/delete-a-cow/${id}`);
    fetchCows();
  };

  const handleSelectBreed = async () => {
    if (!breedFilter) {
      fetchCows();
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/cow/get-cows-by-breed/${breedFilter}`);
      setCows(data.cows || []);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBreed = async () => {
    if (!breedFilter) return alert('Set breed to delete');
    if (!window.confirm(`Delete all cows with breed ${breedFilter}?`)) return;
    await axios.delete(`${API_URL}/cow/delete-cows-by-breed/${breedFilter}`);
    setBreedFilter('');
    fetchCows();
  };

  const handleUpdate = async () => {
    if (!editCow) return;
    await axios.patch(`${API_URL}/cow/update-a-cow/${editCow.id}`, editCow);
    setEditCow(null);
    fetchCows();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" mb={2}>Cows</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <TextField
          label="Filter breed"
          value={breedFilter}
          onChange={e => setBreedFilter(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleSelectBreed}>Search</Button>
        <Button color="error" variant="outlined" onClick={handleDeleteBreed}>Delete by Breed</Button>
        <Button variant="text" onClick={fetchCows}>Show All</Button>
      </Stack>

      {editCow && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Edit Cow</Typography>
            <Grid container spacing={2}>
              {['name', 'breed'].map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  <TextField
                    fullWidth
                    label={field}
                    value={editCow[field]}
                    onChange={e => setEditCow({ ...editCow, [field]: e.target.value })}
                  />
                </Grid>
              ))}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Weight Kg"
                  value={editCow.weightKg || 0}
                  onChange={e => setEditCow({ ...editCow, weightKg: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Milk Yield"
                  value={editCow.milkYield || 0}
                  onChange={e => setEditCow({ ...editCow, milkYield: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={<Switch checked={!!editCow.isPregnant} onChange={e => setEditCow({ ...editCow, isPregnant: e.target.checked })} />}
                  label="Pregnant"
                />
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button variant="contained" onClick={handleUpdate}>Save</Button>
              <Button sx={{ ml: 1 }} onClick={() => setEditCow(null)}>Cancel</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Breed</TableCell>
              <TableCell>Weight Kg</TableCell>
              <TableCell>Milk L/day</TableCell>
              <TableCell>Pregnant</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cows.map((cow: any) => (
              <TableRow key={cow.id}>
                <TableCell>{cow.name}</TableCell>
                <TableCell>{cow.breed}</TableCell>
                <TableCell>{cow.weightKg ?? '-'}</TableCell>
                <TableCell>{cow.milkYield ?? '-'}</TableCell>
                <TableCell>{cow.isPregnant ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => setEditCow(cow)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteCow(cow.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CowsPage;