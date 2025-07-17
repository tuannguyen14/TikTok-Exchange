// src/components/campaigns/CampaignsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/lib/api/campaigns';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
    PlayIcon,
    PauseIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PlusIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon, UserPlusIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ServerTranslations {
    title: string;
    description: string;
    stats: {
        total: string;
        active: string;
        completed: string;
        paused: string;
        creditsSpent: string;
        actionsReceived: string;
    };
    tabs: {
        all: string;
        video: string;
        follow: string;
    };
    table: {
        type: string;
        target: string;
        interaction: string;
        progress: string;
        creditsPerAction: string;
        status: string;
        created: string;
        actions: string;
    };
    status: {
        active: string;
        paused: string;
        completed: string;
        expired: string;
    };
    actions: {
        pause: string;
        resume: string;
        edit: string;
        delete: string;
        view: string;
    };
    buttons: {
        createCampaign: string;
        filter: string;
        refresh: string;
    };
    empty: {
        title: string;
        description: string;
        action: string;
    };
    deleteConfirm: {
        title: string;
        description: string;
        confirm: string;
        cancel: string;
    };
}

interface CampaignsClientProps {
    locale: string;
    serverTranslations: ServerTranslations;
}

export default function CampaignsClient({ locale, serverTranslations }: CampaignsClientProps) {
    const {
        campaigns,
        stats,
        loading,
        error,
        pagination,
        fetchCampaigns,
        updateCampaign,
        deleteCampaign,
        filters,
        setFilters,
        nextPage,
        prevPage,
        setPage,
    } = useCampaigns();

    const [deleteModal, setDeleteModal] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'video' | 'follow'>('all');

    const router = useRouter();

    const dateLocale = locale === 'vi' ? vi : enUS;

    // Filter campaigns based on active tab
    useEffect(() => {
        const newFilters = {
            ...filters,
            type: activeTab === 'all' ? undefined : activeTab,
            page: 1,
        };
        setFilters(newFilters);
        fetchCampaigns(newFilters);
    }, [activeTab]);

    const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
        try {
            setActionLoading(campaignId);
            await updateCampaign({ id: campaignId, status: newStatus });
        } catch (error) {
            console.error('Failed to update campaign status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCampaign = async (campaignId: string) => {
        try {
            setActionLoading(campaignId);
            await deleteCampaign(campaignId);
            setDeleteModal(null);
        } catch (error) {
            console.error('Failed to delete campaign:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <HeartIcon className="h-4 w-4 text-red-500" />;
            case 'view':
                return <EyeIcon className="h-4 w-4 text-blue-500" />;
            case 'comment':
                return <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>;
            default:
                return null;
        }
    };

    const getCampaignTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <VideoCameraIcon className="h-5 w-5 text-purple-500" />;
            case 'follow':
                return <UserPlusIcon className="h-5 w-5 text-blue-500" />;
            default:
                return null;
        }
    };

    if (loading && campaigns.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">{stats.total}</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{serverTranslations.stats.total}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-semibold text-sm">{stats.active}</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{serverTranslations.stats.active}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-semibold text-sm">C</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{serverTranslations.stats.creditsSpent}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCreditsSpent.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-semibold text-sm">A</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{serverTranslations.stats.actionsReceived}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalActionsReceived.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    {/* Tabs */}
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        {(['all', 'video', 'follow'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {serverTranslations.tabs[tab]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => fetchCampaigns()}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {serverTranslations.buttons.refresh}
                    </button>

                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        onClick={() => router.push('/campaigns/new')}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        {serverTranslations.buttons.createCampaign}
                    </button>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{serverTranslations.empty.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{serverTranslations.empty.description}</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                                onClick={() => router.push('/campaigns/new')}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                {serverTranslations.empty.action}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.type}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.target}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.interaction}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.progress}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.creditsPerAction}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.status}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.created}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {serverTranslations.table.actions}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <AnimatePresence>
                                        {campaigns.map((campaign) => (
                                            <motion.tr
                                                key={campaign.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getCampaignTypeIcon(campaign.campaign_type)}
                                                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                                                            {campaign.campaign_type}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {campaign.campaign_type === 'video' ? (
                                                            <span className="font-mono">#{campaign.tiktok_video_id}</span>
                                                        ) : (
                                                            <span>@{campaign.target_tiktok_username}</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {campaign.interaction_type && (
                                                        <div className="flex items-center">
                                                            {getInteractionIcon(campaign.interaction_type)}
                                                            <span className="ml-2 text-sm text-gray-900 capitalize">
                                                                {campaign.interaction_type}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div
                                                                className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.min((campaign.current_count / campaign.target_count) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {campaign.current_count}/{campaign.target_count}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {campaign.credits_per_action}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                                                        {serverTranslations.status[campaign.status]}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(campaign.created_at), {
                                                        addSuffix: true,
                                                        locale: dateLocale
                                                    })}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {campaign.status === 'active' ? (
                                                            <button
                                                                onClick={() => handleStatusChange(campaign.id, 'paused')}
                                                                disabled={actionLoading === campaign.id}
                                                                className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                                            >
                                                                <PauseIcon className="h-4 w-4" />
                                                            </button>
                                                        ) : campaign.status === 'paused' ? (
                                                            <button
                                                                onClick={() => handleStatusChange(campaign.id, 'active')}
                                                                disabled={actionLoading === campaign.id}
                                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                            >
                                                                <PlayIcon className="h-4 w-4" />
                                                            </button>
                                                        ) : null}

                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>

                                                        <button className="text-gray-600 hover:text-gray-900">
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteModal(campaign.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={prevPage}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={nextPage}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                                            {' '}to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span>
                                            {' '}of{' '}
                                            <span className="font-medium">{pagination.total}</span>
                                            {' '}results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={prevPage}
                                                disabled={pagination.page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeftIcon className="h-5 w-5" />
                                            </button>

                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page
                                                        ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={nextPage}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRightIcon className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {serverTranslations.deleteConfirm.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {serverTranslations.deleteConfirm.description}
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    {serverTranslations.deleteConfirm.cancel}
                                </button>
                                <button
                                    onClick={() => handleDeleteCampaign(deleteModal)}
                                    disabled={actionLoading === deleteModal}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === deleteModal ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        serverTranslations.deleteConfirm.confirm
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
                    {error}
                </div>
            )}
        </div>
    );
}