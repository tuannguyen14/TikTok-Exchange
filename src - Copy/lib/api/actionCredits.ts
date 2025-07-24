export interface ActionCreditValue {
    action_type: 'view' | 'like' | 'comment' | 'follow';
    credit_value: number;
}

export class ActionCreditsAPI {
    private baseURL = '/api/action-credits';

    async getActionCredits(): Promise<ActionCreditValue[]> {
        try {
            const response = await fetch(this.baseURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch action credits');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching action credits:', error);
            return [
                { action_type: 'view', credit_value: 1 },
                { action_type: 'like', credit_value: 2 },
                { action_type: 'comment', credit_value: 3 },
                { action_type: 'follow', credit_value: 5 },
            ];
        }
    }

    getCreditValue(actionType: string, actionCredits: ActionCreditValue[]): number {
        const action = actionCredits.find(a => a.action_type === actionType);
        return action?.credit_value || 0;
    }
}