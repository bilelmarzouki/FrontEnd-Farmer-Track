import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, FormControlLabel, Switch, TextField, Typography } from '@mui/material';

const API_URL = 'http://localhost:5005/api';

const AddCowPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', breed: '', weightKg: 0, milkYield: 0, isPregnant: false });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/cow/create-a-cow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(`Created: ${data.cow.name}`);
      navigate('/cows');
    } catch (error) {
      console.error(error);
      alert('Create cow failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" mb={2}>Create Cow</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField value={form.name} label="Name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField value={form.breed} label="Breed" required onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <TextField type="number" value={form.weightKg} label="Weight (Kg)" onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
            <TextField type="number" value={form.milkYield} label="Milk yield (L/day)" onChange={(e) => setForm({ ...form, milkYield: Number(e.target.value) })} />
            <FormControlLabel control={<Switch checked={form.isPregnant} onChange={(e) => setForm({ ...form, isPregnant: e.target.checked })} />} label="Pregnant" />
            <Box>
              <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Creating...' : 'Create Cow'}</Button>
              <Button sx={{ ml: 1 }} onClick={() => navigate('/cows')} variant="outlined">Cancel</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddCowPage;