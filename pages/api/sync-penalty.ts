import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const penalty = req.body;

    if (!penalty.id || !penalty.code || !penalty.player) {
      return res.status(400).json({ 
        error: 'Missing required penalty fields: id, code, player' 
      });
    }

    console.log('Penalty sync requested:', {
      id: penalty.id,
      code: penalty.code,
      name: penalty.name,
      player: penalty.player,
      team: penalty.team,
      quarter: penalty.quarter,
      time: penalty.time,
      callingOfficial: penalty.callingOfficial,
      timestamp: penalty.timestamp
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(200).json({
      success: true,
      message: 'Penalty synced successfully',
      syncedAt: new Date().toISOString(),
      penaltyId: penalty.id,
      processed: true
    });

  } catch (error) {
    console.error('Penalty sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
  } catch (error) {
    console.error('Penalty sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
