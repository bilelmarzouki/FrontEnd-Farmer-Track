export interface Cow {
  id: string;
  name: string;
  breed: string;
  weightKg: number;
  isPregnant: boolean;       
  pregnancyWeek: number;     
  milkYield: number;          
}

export interface Expense {
  id: string;
  cowId: string;
  cow: Cow;
  category: string;
  description: string;
  amount: number;            
  date: string;               
  recurring: boolean;         
}