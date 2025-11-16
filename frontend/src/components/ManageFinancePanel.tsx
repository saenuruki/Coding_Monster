import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, MinusCircle, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { DailyFinances, SavingsAccount } from '../lib/api';

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

interface FinanceData {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings_account?: SavingsAccount;
}

interface ManageFinancePanelProps {
  dailyFinances?: DailyFinances;
  currentMoney: number;
  savingsAccount?: SavingsAccount;
  onUpdateSavings: (newSavingsAccount: SavingsAccount | undefined, moneyDelta: number) => void;
}

export function ManageFinancePanel({ dailyFinances, currentMoney, savingsAccount, onUpdateSavings }: ManageFinancePanelProps) {
  // Use dailyFinances from props or default values
  const [financeData, setFinanceData] = useState<FinanceData>({
    incomes: dailyFinances?.incomes || [
      { id: '1', name: 'Allowance', amount: 200 }
    ],
    expenses: dailyFinances?.expenses || [
      { id: '1', name: 'Living Costs', amount: 100 }
    ],
    savings_account: savingsAccount
  });

  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });
  const [savingsAction, setSavingsAction] = useState({ type: 'add', amount: '' });
  const [showNewSavings, setShowNewSavings] = useState(false);
  const [newSavings, setNewSavings] = useState({ type: 'flexible' as 'fixed' | 'flexible', interest: '' });

  // Update financeData when dailyFinances prop changes (e.g., new day)
  useEffect(() => {
    if (dailyFinances) {
      setFinanceData(prev => ({
        ...prev,
        incomes: dailyFinances.incomes,
        expenses: dailyFinances.expenses,
      }));
    }
  }, [dailyFinances]);

  // Update savings account when prop changes
  useEffect(() => {
    setFinanceData(prev => ({
      ...prev,
      savings_account: savingsAccount,
    }));
  }, [savingsAccount]);

  const totalIncome = financeData.incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = financeData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const addIncome = () => {
    if (newIncome.name && newIncome.amount) {
      setFinanceData({
        ...financeData,
        incomes: [...financeData.incomes, {
          id: Date.now().toString(),
          name: newIncome.name,
          amount: parseFloat(newIncome.amount)
        }]
      });
      setNewIncome({ name: '', amount: '' });
    }
  };

  const removeIncome = (id: string) => {
    setFinanceData({
      ...financeData,
      incomes: financeData.incomes.filter(item => item.id !== id)
    });
  };

  const addExpense = () => {
    if (newExpense.name && newExpense.amount) {
      setFinanceData({
        ...financeData,
        expenses: [...financeData.expenses, {
          id: Date.now().toString(),
          name: newExpense.name,
          amount: parseFloat(newExpense.amount)
        }]
      });
      setNewExpense({ name: '', amount: '' });
    }
  };

  const removeExpense = (id: string) => {
    setFinanceData({
      ...financeData,
      expenses: financeData.expenses.filter(item => item.id !== id)
    });
  };

  const createSavingsAccount = () => {
    if (newSavings.interest) {
      const newAccount: SavingsAccount = {
        type: newSavings.type,
        amount: 0, // Initial amount is 0
        interest: parseFloat(newSavings.interest),
        withdrawCount: 0
      };
      onUpdateSavings(newAccount, 0); // No money change when creating account
      setShowNewSavings(false);
      setNewSavings({ type: 'flexible', interest: '' });
    }
  };

  const handleSavingsAction = () => {
    if (!financeData.savings_account || !savingsAction.amount) return;

    const amount = parseFloat(savingsAction.amount);
    
    if (savingsAction.type === 'add') {
      // Add Money: deduct from current money, add to savings
      if (currentMoney < amount) {
        alert(`Not enough money! You have €${currentMoney.toFixed(2)} but need €${amount.toFixed(2)}.`);
        return;
      }

      const updatedAccount: SavingsAccount = {
        ...financeData.savings_account,
        amount: financeData.savings_account.amount + amount
      };
      onUpdateSavings(updatedAccount, -amount); // Negative delta (money goes to savings)
    } else {
      // Withdraw: deduct from savings, add to current money
      if (financeData.savings_account.type === 'fixed' && 
          (financeData.savings_account.withdrawCount || 0) >= 2) {
        alert('Fixed account: Maximum 2 withdrawals reached');
        return;
      }

      if (amount > financeData.savings_account.amount) {
        alert('Insufficient funds in savings account');
        return;
      }

      const updatedAccount: SavingsAccount = {
        ...financeData.savings_account,
        amount: financeData.savings_account.amount - amount,
        withdrawCount: financeData.savings_account.type === 'fixed' 
          ? (financeData.savings_account.withdrawCount || 0) + 1 
          : financeData.savings_account.withdrawCount
      };
      onUpdateSavings(updatedAccount, amount); // Positive delta (money comes from savings)
    }
    
    setSavingsAction({ type: 'add', amount: '' });
  };

  return (
    <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-white text-lg font-semibold">Manage Finance</p>
        <p className="text-white/60 text-sm">Track your spending power.</p>
      </div>

      {/* Balance Overview */}
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Net Balance</p>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              €{netBalance.toFixed(2)}
            </p>
          </div>
          <img src="/person/pig.png" alt="Piggy Bank" className="h-12 w-12 object-contain" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-white/60 text-xs">Total Income</p>
            <p className="text-emerald-400 text-lg font-semibold">€{totalIncome.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Total Expenses</p>
            <p className="text-red-400 text-lg font-semibold">€{totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incomes Section */}
        <Card className="bg-black/20 border-white/10 p-4 flex flex-col gap-3">
          <h3 className="text-white font-semibold text-sm">Incomes</h3>
          <div className="space-y-2 flex-1 overflow-y-auto min-h-[200px]">
            {financeData.incomes.map(income => (
              <div key={income.id} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
                <span className="text-white text-sm">{income.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold text-sm">€{income.amount}</span>
                  <button onClick={() => removeIncome(income.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Input
              placeholder="Income name"
              value={newIncome.name}
              onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount (€)"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
              />
              <Button onClick={addIncome} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Expenses Section */}
        <Card className="bg-black/20 border-white/10 p-4 flex flex-col gap-3">
          <h3 className="text-white font-semibold text-sm">Expenses</h3>
          <div className="space-y-2 flex-1 overflow-y-auto min-h-[200px]">
            {financeData.expenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                <span className="text-white text-sm">{expense.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-semibold text-sm">€{expense.amount}</span>
                  <button onClick={() => removeExpense(expense.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Input
              placeholder="Expense name"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount (€)"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
              />
              <Button onClick={addExpense} className="bg-red-600 hover:bg-red-700 text-white">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Savings Account Section */}
      <Card className="bg-black/20 border-white/10 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Savings Account</h3>
          {!financeData.savings_account && !showNewSavings && (
            <Button 
              onClick={() => setShowNewSavings(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
            >
              Open New
            </Button>
          )}
        </div>

        {showNewSavings && (
          <div className="space-y-3 bg-purple-500/10 border border-purple-500/20 rounded p-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Account Type</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setNewSavings({ ...newSavings, type: 'fixed' })}
                  className={`flex-1 ${newSavings.type === 'fixed' ? 'bg-purple-600' : 'bg-[#2b2b2b]'} text-white`}
                >
                  Fixed
                </Button>
                <Button
                  onClick={() => setNewSavings({ ...newSavings, type: 'flexible' })}
                  className={`flex-1 ${newSavings.type === 'flexible' ? 'bg-purple-600' : 'bg-[#2b2b2b]'} text-white`}
                >
                  Flexible
                </Button>
              </div>
              <p className="text-white/40 text-xs">
                {newSavings.type === 'fixed' ? 'Up to 2 withdrawals allowed' : 'Unlimited withdrawals'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Interest Rate (AER %)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 3.8"
                value={newSavings.interest}
                onChange={(e) => setNewSavings({ ...newSavings, interest: e.target.value })}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSavingsAccount} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                Create Account
              </Button>
              <Button onClick={() => setShowNewSavings(false)} className="flex-1 bg-[#2b2b2b] hover:bg-[#4a4a4a] text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {financeData.savings_account && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs">Type</p>
                  <p className="text-white font-semibold capitalize">{financeData.savings_account.type}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Interest Rate</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <p className="text-emerald-400 font-semibold">{financeData.savings_account.interest}%</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-xs">Amount Saved</p>
                <p className="text-purple-400 text-2xl font-bold">€{financeData.savings_account.amount.toFixed(2)}</p>
              </div>
              {financeData.savings_account.type === 'fixed' && (
                <p className="text-white/40 text-xs">
                  Withdrawals: {financeData.savings_account.withdrawCount || 0} / 2
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => setSavingsAction({ ...savingsAction, type: 'add' })}
                  className={`flex-1 ${savingsAction.type === 'add' ? 'bg-emerald-600' : 'bg-[#2b2b2b]'} text-white`}
                >
                  Add Money
                </Button>
                <Button
                  onClick={() => setSavingsAction({ ...savingsAction, type: 'withdraw' })}
                  className={`flex-1 ${savingsAction.type === 'withdraw' ? 'bg-orange-600' : 'bg-[#2b2b2b]'} text-white`}
                >
                  Withdraw
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount (€)"
                  value={savingsAction.amount}
                  onChange={(e) => setSavingsAction({ ...savingsAction, amount: e.target.value })}
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
                />
                <Button 
                  onClick={handleSavingsAction}
                  className={`${savingsAction.type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
                >
                  {savingsAction.type === 'add' ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </Card>
  );
}

