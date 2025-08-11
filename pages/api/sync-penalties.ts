import type { NextApiRequest, NextApiResponse } from 'next';
import { syncPenaltiesToSheet } from '@/lib/google-sheets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { penalties, gameInfo } = req.body;
    
    // Call the sync function
    const result = await syncPenaltiesToSheet(penalties, gameInfo);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json({ error: 'Failed to sync', details: result.error });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

