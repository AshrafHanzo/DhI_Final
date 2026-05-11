import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, ListChecks, Plus, Edit, Trash2, Save, AlertCircle, Globe, Calendar, UserCheck, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';

interface StatusItem {
    id: number;
    name: string;
    display_order: number;
    is_active: boolean;
}

interface Recruiter {
    id: number;
    name: string;
    is_active: boolean;
}

// Reusable Status Section Component
function StatusSection({
    title,
    description,
    items,
    icon: Icon,
    colorClass,
    onAdd,
    onEdit,
    onDelete,
    showOrder = true
}: {
    title: string;
    description: string;
    items: StatusItem[];
    icon: any;
    colorClass: string;
    onAdd: () => void;
    onEdit: (item: StatusItem) => void;
    onDelete: (id: number) => void;
    showOrder?: boolean;
}) {
    return (
        <Card className="border-2">
            <CardHeader className={colorClass}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <CardDescription className="text-xs">{description}</CardDescription>
                        </div>
                    </div>
                    <Button onClick={onAdd} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                {showOrder && <TableHead className="w-[60px] text-center">Order</TableHead>}
                                <TableHead className="w-[80px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={showOrder ? 3 : 2} className="text-center text-muted-foreground py-6">
                                        No items added yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-sm">{item.name}</TableCell>
                                        {showOrder && (
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="text-xs">{item.display_order}</Badge>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <div className="flex gap-1 justify-center">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(item.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminSettings() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    // Redirect non-admin users
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            toast({ title: 'Access Denied', description: 'Only admins can access this page', variant: 'destructive' });
        }
    }, [user, navigate, toast]);

    // State for all data types
    const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
    const [screeningStatuses, setScreeningStatuses] = useState<StatusItem[]>([]);
    const [sourcedFrom, setSourcedFrom] = useState<StatusItem[]>([]);
    const [interviewStatuses, setInterviewStatuses] = useState<StatusItem[]>([]);
    const [joinedStatuses, setJoinedStatuses] = useState<StatusItem[]>([]);
    const [readyToInterviewStatuses, setReadyToInterviewStatuses] = useState<StatusItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'recruiter' | 'screening' | 'sourced' | 'interview' | 'joined' | 'ready'>('recruiter');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemName, setItemName] = useState('');
    const [itemOrder, setItemOrder] = useState(0);

    // Fetch all data
    const fetchData = async () => {
        try {
            const endpoints = [
                'recruiters',
                'screening-statuses',
                'sourced-from',
                'interview-statuses',
                'joined-statuses',
                'ready-to-interview-statuses'
            ];

            const responses = await Promise.all(
                endpoints.map(ep => fetch(`${API_BASE_URL}/api/admin/${ep}`))
            );

            const [recruitersData, screeningData, sourcedData, interviewData, joinedData, readyData] = await Promise.all(
                responses.map(res => res.ok ? res.json() : [])
            );

            setRecruiters(recruitersData);
            setScreeningStatuses(screeningData);
            setSourcedFrom(sourcedData);
            setInterviewStatuses(interviewData);
            setJoinedStatuses(joinedData);
            setReadyToInterviewStatuses(readyData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast({ title: 'Error', description: 'Failed to load settings data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Get API endpoint for type
    const getEndpoint = (type: string) => {
        const endpoints: Record<string, string> = {
            recruiter: 'recruiters',
            screening: 'screening-statuses',
            sourced: 'sourced-from',
            interview: 'interview-statuses',
            joined: 'joined-statuses',
            ready: 'ready-to-interview-statuses'
        };
        return endpoints[type];
    };

    // Open dialog
    const openDialog = (type: typeof dialogType, item?: any) => {
        setDialogType(type);
        setEditingItem(item || null);
        setItemName(item?.name || '');
        setItemOrder(item?.display_order || 0);
        setDialogOpen(true);
    };

    // Save handler
    const handleSave = async () => {
        if (!itemName.trim()) {
            toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
            return;
        }

        try {
            const endpoint = getEndpoint(dialogType);
            const url = editingItem
                ? `${API_BASE_URL}/api/admin/${endpoint}/${editingItem.id}`
                : `${API_BASE_URL}/api/admin/${endpoint}`;

            const body = dialogType === 'recruiter'
                ? { name: itemName.trim() }
                : { name: itemName.trim(), display_order: itemOrder };

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast({ title: 'Success', description: editingItem ? 'Updated successfully' : 'Added successfully' });
            setDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
        }
    };

    // Delete handler
    const handleDelete = async (type: typeof dialogType, id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const endpoint = getEndpoint(type);
            const res = await fetch(`${API_BASE_URL}/api/admin/${endpoint}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast({ title: 'Deleted', description: 'Item removed successfully' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    if (user?.role !== 'admin') return null;

    const dialogTitles: Record<string, string> = {
        recruiter: 'Recruiter',
        screening: 'Screening Status',
        sourced: 'Source Option',
        interview: 'Interview Status',
        joined: 'Joined Status',
        ready: 'Ready to Interview Status'
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Admin Settings
                    </h1>
                    <p className="text-muted-foreground">Manage ATS configuration and master data</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                    Changes made here will affect the entire ATS system. Please be careful when modifying settings.
                </p>
            </div>

            {/* Grid of settings sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Recruiters */}
                <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle className="text-base">Recruiters</CardTitle>
                                    <CardDescription className="text-xs">Manage recruiter names</CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => openDialog('recruiter')} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="w-[80px] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recruiters.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium text-sm">{r.name}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 justify-center">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('recruiter', r)}>
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDelete('recruiter', r.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Screening Statuses */}
                <StatusSection
                    title="Screening Statuses"
                    description="Application screening options"
                    items={screeningStatuses}
                    icon={ListChecks}
                    colorClass="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                    onAdd={() => openDialog('screening')}
                    onEdit={(item) => openDialog('screening', item)}
                    onDelete={(id) => handleDelete('screening', id)}
                />

                {/* Sourced From */}
                <StatusSection
                    title="Sourced From"
                    description="Candidate source options"
                    items={sourcedFrom}
                    icon={Globe}
                    colorClass="bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700"
                    onAdd={() => openDialog('sourced')}
                    onEdit={(item) => openDialog('sourced', item)}
                    onDelete={(id) => handleDelete('sourced', id)}
                />

                {/* Interview Statuses */}
                <StatusSection
                    title="Interview Statuses"
                    description="Interview stage options"
                    items={interviewStatuses}
                    icon={Calendar}
                    colorClass="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700"
                    onAdd={() => openDialog('interview')}
                    onEdit={(item) => openDialog('interview', item)}
                    onDelete={(id) => handleDelete('interview', id)}
                />

                {/* Joined Statuses */}
                <StatusSection
                    title="Joined Statuses"
                    description="Post-selection status options"
                    items={joinedStatuses}
                    icon={UserCheck}
                    colorClass="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700"
                    onAdd={() => openDialog('joined')}
                    onEdit={(item) => openDialog('joined', item)}
                    onDelete={(id) => handleDelete('joined', id)}
                />

                {/* Ready to Interview Statuses */}
                <StatusSection
                    title="Ready to Interview Statuses"
                    description="Status options for interview readiness"
                    items={readyToInterviewStatuses}
                    icon={ClipboardCheck}
                    colorClass="bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700"
                    onAdd={() => openDialog('ready')}
                    onEdit={(item) => openDialog('ready', item)}
                    onDelete={(id) => handleDelete('ready', id)}
                />
            </div>

            {/* Universal Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? `Edit ${dialogTitles[dialogType]}` : `Add ${dialogTitles[dialogType]}`}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the details below' : 'Enter the details for the new item'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="itemName">Name</Label>
                            <Input
                                id="itemName"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="Enter name"
                            />
                        </div>
                        {dialogType !== 'recruiter' && (
                            <div className="space-y-2">
                                <Label htmlFor="itemOrder">Display Order</Label>
                                <Input
                                    id="itemOrder"
                                    type="number"
                                    value={itemOrder}
                                    onChange={(e) => setItemOrder(parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">Lower numbers appear first in dropdowns</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
