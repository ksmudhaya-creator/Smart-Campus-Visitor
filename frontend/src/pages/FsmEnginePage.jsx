import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  AlertTriangle,
  History,
  Info,
  Check,
  Ban
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';

const ALL_STATES = [
  'REGISTERED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'ENTRY_APPROVED',
  'CHECKED_IN',
  'INSIDE_CAMPUS',
  'CHECKED_OUT',
  'REJECTED',
  'CANCELLED'
];

const FsmEnginePage = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [targetState, setTargetState] = useState('');
  const [fsmDefinition, setFsmDefinition] = useState(null);

  // Validation Result
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [executing, setExecuting] = useState(false);

  // History & Filter
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'VALID' | 'INVALID'
  const [executionMessage, setExecutionMessage] = useState(null);

  // Load initial FSM definition and visitors
  useEffect(() => {
    fetchFsmDefinition();
    fetchVisitors();
  }, []);

  // Whenever selected visitor changes, fetch their specific transition history and reset validation
  useEffect(() => {
    if (selectedVisitor?.visitorId) {
      fetchVisitorHistory(selectedVisitor.visitorId);
      // Auto-validate current target state if selected
      if (targetState) {
        runValidation(selectedVisitor.currentState, targetState, selectedVisitor.visitorId);
      } else {
        setValidationResult(null);
      }
    }
  }, [selectedVisitor]);

  const fetchFsmDefinition = async () => {
    try {
      const res = await api.get('/fsm/definition');
      if (res.data) {
        setFsmDefinition(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch FSM definition:', err);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await api.get('/visitors', { params: { limit: 50 } });
      if (res.data?.data) {
        setVisitors(res.data.data);
        if (res.data.data.length > 0 && !selectedVisitor) {
          setSelectedVisitor(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
    }
  };

  const fetchVisitorHistory = async (visitorId) => {
    try {
      const res = await api.get(`/fsm/history/${visitorId}`);
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch visitor transition history:', err);
    }
  };

  const runValidation = async (current, target, visitorId) => {
    if (!current || !target) return;
    try {
      setValidating(true);
      const res = await api.post('/fsm/validate', {
        currentState: current,
        targetState: target,
        visitorId
      });
      if (res.data && res.data.validation) {
        setValidationResult(res.data.validation);
      }
    } catch (err) {
      console.error('Validation API error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleTargetSelect = (state) => {
    setTargetState(state);
    if (selectedVisitor) {
      runValidation(selectedVisitor.currentState, state, selectedVisitor.visitorId);
    }
  };

  const handleExecuteTransition = async () => {
    if (!selectedVisitor || !targetState) return;

    try {
      setExecuting(true);
      setExecutionMessage(null);

      const res = await api.post('/fsm/transition', {
        visitorId: selectedVisitor.visitorId,
        targetState,
        description: `Executed via Interactive FSM Transition Engine by operator`
      });

      if (res.data && res.data.success) {
        setExecutionMessage({
          type: 'success',
          text: `Success! Visitor ${selectedVisitor.fullName} successfully transitioned to ${targetState}.`
        });

        // Update selected visitor state locally and in list
        const updated = res.data.visitor;
        setSelectedVisitor(updated);
        setVisitors((prev) =>
          prev.map((v) => (v.visitorId === updated.visitorId ? updated : v))
        );

        // Re-fetch audit history to show newly executed transition
        fetchVisitorHistory(updated.visitorId);

        // Re-evaluate target state
        runValidation(updated.currentState, targetState, updated.visitorId);
      }
    } catch (err) {
      // Backend rejected the transition
      const errorMsg = err.response?.data?.message || 'Transition rejected by FSM engine';
      setExecutionMessage({
        type: 'error',
        text: `FSM Engine Rejected: ${errorMsg}`
      });

      // Still re-fetch history because the illegal attempt was logged to DB!
      fetchVisitorHistory(selectedVisitor.visitorId);
    } finally {
      setExecuting(false);
    }
  };

  // Preset demo test cases
  const loadTestCase = (presetType) => {
    if (!visitors.length) return;

    if (presetType === 'LEGAL_CHECKIN') {
      // Find an ENTRY_APPROVED visitor
      const visitor = visitors.find((v) => v.currentState === 'ENTRY_APPROVED') || visitors[0];
      setSelectedVisitor(visitor);
      setTargetState('CHECKED_IN');
      runValidation(visitor.currentState, 'CHECKED_IN', visitor.visitorId);
    } else if (presetType === 'ILLEGAL_PREMATURE_CHECKIN') {
      // Find a REGISTERED visitor and test CHECKED_IN
      const visitor = visitors.find((v) => v.currentState === 'REGISTERED') || visitors[0];
      setSelectedVisitor(visitor);
      setTargetState('CHECKED_IN');
      runValidation(visitor.currentState, 'CHECKED_IN', visitor.visitorId);
    } else if (presetType === 'ILLEGAL_REENTRY_AFTER_CHECKOUT') {
      // Find a CHECKED_OUT visitor and test INSIDE_CAMPUS
      const visitor = visitors.find((v) => v.currentState === 'CHECKED_OUT') || visitors[0];
      setSelectedVisitor(visitor);
      setTargetState('INSIDE_CAMPUS');
      runValidation(visitor.currentState, 'INSIDE_CAMPUS', visitor.visitorId);
    }
  };

  // Filtered History Records
  const filteredHistory = history.filter((h) => {
    if (historyFilter === 'VALID') return h.isValid === true;
    if (historyFilter === 'INVALID') return h.isValid === false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
              CORE MATHEMATICAL MODEL
            </span>
            <span className="text-xs text-purple-200">• Section 5 & 6 Requirement</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-purple-300" />
            Interactive FSM Transition Engine & Validator
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
            Strict state machine governing visitor entry and exit. Transitions are validated deterministically on the backend to prevent security bypasses, duplicate check-ins, or re-entries.
          </p>
        </div>

        {/* Preset Academic Test Scenarios */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-xs shrink-0 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
            Quick Test Cases
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => loadTestCase('LEGAL_CHECKIN')}
              className="text-left px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded text-[11px] font-semibold transition-colors flex items-center justify-between gap-2"
            >
              <span>Valid: ENTRY_APPROVED ➔ CHECKED_IN</span>
              <Check className="w-3 h-3 text-emerald-400" />
            </button>
            <button
              onClick={() => loadTestCase('ILLEGAL_PREMATURE_CHECKIN')}
              className="text-left px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded text-[11px] font-semibold transition-colors flex items-center justify-between gap-2"
            >
              <span>Illegal: REGISTERED ➔ CHECKED_IN</span>
              <Ban className="w-3 h-3 text-rose-400" />
            </button>
            <button
              onClick={() => loadTestCase('ILLEGAL_REENTRY_AFTER_CHECKOUT')}
              className="text-left px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded text-[11px] font-semibold transition-colors flex items-center justify-between gap-2"
            >
              <span>Illegal: CHECKED_OUT ➔ INSIDE_CAMPUS</span>
              <Ban className="w-3 h-3 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Workbench (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Controls & State Selectors */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visitor Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Select Visitor to Test
            </label>
            <select
              value={selectedVisitor?.visitorId || ''}
              onChange={(e) => {
                const found = visitors.find((v) => v.visitorId === e.target.value);
                setSelectedVisitor(found);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            >
              {visitors.map((v) => (
                <option key={v.visitorId} value={v.visitorId}>
                  {v.visitorId} — {v.fullName} [{v.currentState}]
                </option>
              ))}
            </select>

            {selectedVisitor && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current State:</span>
                  <StateBadge state={selectedVisitor.currentState} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedVisitor.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Person to Meet:</span>
                  <span className="font-semibold text-slate-800">{selectedVisitor.personToMeet}</span>
                </div>
              </div>
            )}
          </div>

          {/* Target State Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Select Target State for Transition
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_STATES.map((state) => {
                const isSelected = targetState === state;
                const isCurrent = selectedVisitor?.currentState === state;

                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleTargetSelect(state)}
                    className={`p-2.5 rounded-xl text-[11px] font-bold text-center border transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-600/30'
                        : isCurrent
                        ? 'border-slate-300 bg-slate-100 text-slate-500 opacity-70'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="truncate font-mono">{state}</p>
                    {isCurrent && (
                      <span className="text-[9px] text-blue-600 font-bold block mt-0.5">
                        (Current)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Transition Execution Button */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Execute FSM Transition
            </label>
            <p className="text-xs text-slate-500">
              Commit transition to database. Valid transitions update the visitor state; invalid transitions are blocked by the backend and logged as illegal attempts.
            </p>

            <button
              onClick={handleExecuteTransition}
              disabled={executing || !selectedVisitor || !targetState}
              className={`w-full py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
                validationResult?.isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Play className="w-4 h-4" />
              <span>
                {executing
                  ? 'Evaluating & Transiting...'
                  : `Execute Transition: ${selectedVisitor?.currentState || 'STATE'} ➔ ${targetState || 'TARGET'}`}
              </span>
            </button>

            {executionMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${
                  executionMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {executionMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): FSM Engine Validator Display & Graph */}
        <div className="lg:col-span-7 space-y-5">
          {/* FSM Live Validator Result Display */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Live Transition Validation Engine
              </h3>
              <span className="text-[10px] font-mono text-slate-400">FSM-CORE-V2.0</span>
            </div>

            {/* State Comparison Display */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-around gap-2 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Current State
                </span>
                <span className="font-mono text-sm font-extrabold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs inline-block">
                  {selectedVisitor?.currentState || 'NONE'}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">TRANSITION</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Target State
                </span>
                <span className="font-mono text-sm font-extrabold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-xs inline-block">
                  {targetState || 'Select Target'}
                </span>
              </div>
            </div>

            {/* Validator Result Card */}
            {validating ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Running FSM mathematical validation...
              </div>
            ) : !targetState ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Select a target state on the left to test transition legality.
              </div>
            ) : validationResult?.isValid ? (
              /* VALID TRANSITION (GREEN) */
              <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-emerald-900">VALID TRANSITION</h4>
                    <span className="text-xs font-semibold text-emerald-700">
                      Permissible State Machine Transition
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                  <span className="font-bold block mb-0.5">FSM Justification:</span>
                  <p className="leading-relaxed">{validationResult.reason}</p>
                </div>

                {validationResult.allowedNextStates?.length > 0 && (
                  <div className="text-[11px] text-emerald-800">
                    <span className="font-bold">All Permissible Next States from {selectedVisitor?.currentState}: </span>
                    <span className="font-mono">
                      [{validationResult.allowedNextStates.join(', ')}]
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* ILLEGAL TRANSITION (RED) */
              <div className="bg-rose-50 border-2 border-rose-500/30 rounded-2xl p-5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 text-rose-700">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-rose-900">ILLEGAL TRANSITION</h4>
                    <span className="text-xs font-semibold text-rose-700">
                      Rejected by State Machine Engine
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-xs text-rose-900">
                  <span className="font-bold block mb-0.5">Violation Reason:</span>
                  <p className="leading-relaxed">{validationResult?.reason}</p>
                </div>

                {validationResult?.allowedNextStates?.length > 0 ? (
                  <div className="text-[11px] text-rose-800">
                    <span className="font-bold">Permissible Next States from {selectedVisitor?.currentState}: </span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-200">
                      [{validationResult.allowedNextStates.join(', ')}]
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-rose-800 font-semibold">
                    State '{selectedVisitor?.currentState}' is a terminal state. No transitions allowed.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permissible Transition Matrix Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Permissible FSM Transition Reference Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-blue-700">REGISTERED</span> ➔ PENDING_VERIFICATION, CANCELLED
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-amber-700">PENDING_VERIFICATION</span> ➔ VERIFIED, REJECTED
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-indigo-700">VERIFIED</span> ➔ ENTRY_APPROVED, REJECTED
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-purple-700">ENTRY_APPROVED</span> ➔ CHECKED_IN, CANCELLED
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-teal-700">CHECKED_IN</span> ➔ INSIDE_CAMPUS
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-emerald-700">INSIDE_CAMPUS</span> ➔ CHECKED_OUT
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 col-span-1 sm:col-span-2 text-slate-500">
                <span className="font-bold text-rose-700">TERMINAL STATES:</span> CHECKED_OUT, REJECTED, CANCELLED (No outbound paths)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Transition Audit History & Illegal Attempts Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Transition History for {selectedVisitor?.fullName || 'Selected Visitor'} ({filteredHistory.length} events)
            </h3>
            <p className="text-xs text-slate-500">
              Includes both valid state executions and recorded illegal transition attempts.
            </p>
          </div>

          {/* Filter Valid vs Illegal */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setHistoryFilter('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                historyFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setHistoryFilter('VALID')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                historyFilter === 'VALID'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Valid Only
            </button>
            <button
              onClick={() => setHistoryFilter('INVALID')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                historyFilter === 'INVALID'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Illegal Attempts
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No transition events found matching this filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">State Transition</th>
                  <th className="py-2.5 px-4">Validity</th>
                  <th className="py-2.5 px-4">Reason / System Description</th>
                  <th className="py-2.5 px-4 text-right">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((h, i) => (
                  <tr
                    key={h._id || i}
                    className={`transition-colors ${
                      !h.isValid ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(h.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        <span className="text-slate-700">{h.previousState}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-purple-700">{h.newState}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.isValid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {h.isValid ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>VALID</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            <span>ILLEGAL ATTEMPT</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {h.reason || h.description}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {h.actionBy?.name || 'System'}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {h.actionBy?.role || 'SYSTEM'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FsmEnginePage;
