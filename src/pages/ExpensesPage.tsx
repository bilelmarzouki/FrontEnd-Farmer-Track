
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper, FormControlLabel, Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cows, setCows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);

  const [expenseForm, setExpenseForm] = useState({ cowId: '', category: '', description: '', amount: 0, date: '', recurring: false });
  const [filterBreed, setFilterBreed] = useState('');
  const [range, setRange] = useState({ startDate: '', endDate: '' });
  const [monthlyQuery, setMonthlyQuery] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [editExpense, setEditExpense] = useState<any>(null);

  const fetchCows = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/cow/get-all-cows`);
      setCows(data.cows || []);
    } catch (err) {
      console.error('fetchCows', err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/expense/get-all-expenses`);
      setExpenses(data.expenses || []);
      setTotal(data.totalExpenses || 0);
    } catch (err) {
      console.error(err);
      alert('Cannot fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCows(); fetchAll(); }, []);

  const handleCreate = async () => {
    if (!expenseForm.cowId || !expenseForm.category || expenseForm.amount <= 0 || !expenseForm.date) {
      return alert('Please fill all required fields with non-zero amount');
    }

    const payload = {
      ...expenseForm,
      date: new Date(expenseForm.date).toISOString(),
      amount: Number(expenseForm.amount),
      recurring: Boolean(expenseForm.recurring),
    };
    console.log('Submitting Expense', payload);

    try {
      const response = await axios.post(`${API_URL}/expense/create-an-expense/cows/${expenseForm.cowId}`, payload);
      console.log('Create response', response.data);
      setExpenseForm({ cowId: '', category: '', description: '', amount: 0, date: '', recurring: false });
      fetchAll();
      alert('Expense created');
    } catch (err: any) {
      console.error('Create request failed:', err.response ? err.response.data : err.message || err);
      const reason = err.response?.data?.error || err.response?.data?.message || err.message || 'server error';
      alert(`Failed to create expense: ${reason}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    await axios.delete(`${API_URL}/expense/delete-expense/${id}`);
    fetchAll();
  };

  const handleUpdate = async () => {
    if (!editExpense) return;
    await axios.patch(`${API_URL}/expense/update-expense/${editExpense.id}`, editExpense);
    setEditExpense(null);
    fetchAll();
  };

  const handleFilterByBreed = async () => {
    if (!filterBreed) return fetchAll();
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/expense/get-all-expenses-byBreed/${filterBreed}`);
      setExpenses(data.expenses || []);
      setTotal(data.breedExpenses || 0);
    } catch (err) {
      console.error(err);
      alert('Could not get expenses by breed');
    } finally {
      setLoading(false);
    }
  };

  const handleRange = async () => {
    if (!range.startDate || !range.endDate) return alert('Set both dates');
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/expense/get-all-expenses`, {
        params: { startDate: range.startDate, endDate: range.endDate },
      });
      setExpenses(data.expenses || []);
      setTotal(data.totalExpenses || 0);
    } catch (err) {
      console.error(err);
      alert('Could not filter date range');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/expense/monthly-summary/${monthlyQuery.year}/${monthlyQuery.month}`);
      setMonthlySummary(data);
    } catch (err) {
      console.error(err);
      alert('Could not fetch monthly summary');
    }
  };

  if (loading) return (<Box display="flex" justifyContent="center" alignItems="center" height="60vh"><CircularProgress/></Box>);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>Expenses</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Expense Form</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                SelectProps={{ native: true }}
                fullWidth
                label="Cow"
                value={expenseForm.cowId}
                onChange={(e) => setExpenseForm({ ...expenseForm, cowId: e.target.value })}
                required
              >
                <option value="">Select cow</option>
                {cows.map((cow) => (
                  <option key={cow.id} value={cow.id}>{`${cow.name} (${cow.breed})`}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Category" value={expenseForm.category} onChange={(e)=>setExpenseForm({...expenseForm,category:e.target.value})} required /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Amount" type="number" value={expenseForm.amount} onChange={(e)=>setExpenseForm({...expenseForm,amount:Number(e.target.value)})} required /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={expenseForm.date} onChange={(e)=>setExpenseForm({...expenseForm,date:e.target.value})} required /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Description" value={expenseForm.description} onChange={(e)=>setExpenseForm({...expenseForm,description:e.target.value})} /></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={expenseForm.recurring} onChange={(e)=>setExpenseForm({...expenseForm,recurring:e.target.checked})}/>} label="Recurring" /></Grid>
            <Grid item xs={12}><Button onClick={handleCreate} variant="contained">Create Expense</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      {editExpense && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Update Expense</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth label="Category" value={editExpense.category} onChange={(e)=>setEditExpense({...editExpense, category: e.target.value})}/></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Amount" type="number" value={editExpense.amount} onChange={(e)=>setEditExpense({...editExpense, amount: Number(e.target.value)})}/></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={editExpense.date?.split('T')[0] || ''} onChange={(e)=>setEditExpense({...editExpense,date: e.target.value})}/></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" value={editExpense.description} onChange={(e)=>setEditExpense({...editExpense,description:e.target.value})}/></Grid>
            </Grid>
            <Box mt={2}><Button onClick={handleUpdate} variant="contained">Save</Button><Button sx={{ ml:1 }} onClick={()=>setEditExpense(null)}>Cancel</Button></Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}><TextField fullWidth label="Filter by breed" value={filterBreed} onChange={(e)=>setFilterBreed(e.target.value)} /></Grid>
            <Grid item><Button variant="contained" onClick={handleFilterByBreed}>Search Breed</Button></Grid>
            <Grid item><Button variant="text" onClick={fetchAll}>Reset</Button></Grid>
            <Grid item xs={12}>{total.toFixed(2)} TND total</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}><TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={range.startDate} onChange={(e)=>setRange({...range,startDate:e.target.value})} fullWidth /></Grid>
            <Grid item xs={12} md={5}><TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} value={range.endDate} onChange={(e)=>setRange({...range,endDate:e.target.value})} fullWidth /></Grid>
            <Grid item><Button variant="contained" onClick={handleRange}>Apply Range</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} md={3}><TextField label="Year" type="number" value={monthlyQuery.year} onChange={(e)=>setMonthlyQuery({...monthlyQuery,year:Number(e.target.value)})} fullWidth /></Grid>
            <Grid item xs={6} md={3}><TextField label="Month" type="number" value={monthlyQuery.month} onChange={(e)=>setMonthlyQuery({...monthlyQuery,month:Number(e.target.value)})} fullWidth /></Grid>
            <Grid item><Button variant="contained" onClick={fetchMonthlySummary}>Get Month Summary</Button></Grid>
            {monthlySummary && (<Grid item xs={12}><Typography>{`Period: ${monthlySummary.period}, Count: ${monthlySummary.count}, Total: ${monthlySummary.totalExpensesInThisMonth} TND`}</Typography></Grid>)}
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Cow</TableCell>
              <TableCell>Breed</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.id}</TableCell>
                <TableCell>{exp.cow?.name || exp.cowId}</TableCell>
                <TableCell>{exp.cow?.breed ?? '-'}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>{exp.amount}</TableCell>
                <TableCell>{exp.date?.split('T')[0] || exp.date}</TableCell>
                <TableCell>{exp.recurring ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => setEditExpense(exp)}><EditIcon/></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(exp.id)}><DeleteIcon/></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ExpensesPage;
