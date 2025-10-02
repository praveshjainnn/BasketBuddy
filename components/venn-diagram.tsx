"use client"

type SetData = {
  id: string
  name: string
  elements: Set<string>
  color: string
}

type VennDiagramProps = {
  sets: SetData[]
}

export default function VennDiagram({ sets }: VennDiagramProps) {
  if (sets.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Add sets to visualize</div>
  }

  const renderTwoSets = () => {
    // Calculate regions for annotations
    const leftOnly = Array.from(sets[0].elements).filter((e) => !sets[1].elements.has(e)).length;
    const intersection = Array.from(sets[0].elements).filter((e) => sets[1].elements.has(e)).length;
    const rightOnly = Array.from(sets[1].elements).filter((e) => !sets[0].elements.has(e)).length;
    
    return (
      <svg viewBox="0 0 400 300" className="w-full h-auto">
        {/* Set A */}
        <circle
          cx="140"
          cy="150"
          r="80"
          fill={sets[0].color}
          stroke={sets[0].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set B */}
        <circle
          cx="260"
          cy="150"
          r="80"
          fill={sets[1].color}
          stroke={sets[1].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Labels */}
        <text x="100" y="100" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[0].name}
        </text>
        <text x="280" y="100" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[1].name}
        </text>
        
        {/* Element counts */}
        <text x="110" y="155" fontSize="14" fill="currentColor" textAnchor="middle">
          {leftOnly}
        </text>
        <text x="200" y="155" fontSize="14" fill="currentColor" textAnchor="middle">
          {intersection}
        </text>
        <text x="290" y="155" fontSize="14" fill="currentColor" textAnchor="middle">
          {rightOnly}
        </text>
        
        {/* Operation Annotations */}
        {/* Difference (A-B) */}
        <text x="110" y="180" fontSize="10" fill="currentColor" textAnchor="middle" fontStyle="italic">
          Difference (A-B)
        </text>
        
        {/* Intersection */}
        <text x="200" y="180" fontSize="10" fill="currentColor" textAnchor="middle" fontStyle="italic">
          Intersection
        </text>
        
        {/* Difference (B-A) */}
        <text x="290" y="180" fontSize="10" fill="currentColor" textAnchor="middle" fontStyle="italic">
          Difference (B-A)
        </text>
        
        {/* Union - covers the entire diagram */}
        <text x="200" y="230" fontSize="12" fill="currentColor" textAnchor="middle" fontWeight="bold">
          Union: {leftOnly + intersection + rightOnly} items
        </text>
        
        {/* Symmetric Difference */}
        <text x="200" y="250" fontSize="12" fill="currentColor" textAnchor="middle" fontWeight="bold">
          Symmetric Difference: {leftOnly + rightOnly} items
        </text>
      </svg>
    )
  }

  const renderThreeSets = () => {
    return (
      <svg viewBox="0 0 400 350" className="w-full h-auto">
        {/* Set A */}
        <circle
          cx="150"
          cy="140"
          r="75"
          fill={sets[0].color}
          stroke={sets[0].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set B */}
        <circle
          cx="250"
          cy="140"
          r="75"
          fill={sets[1].color}
          stroke={sets[1].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set C */}
        <circle
          cx="200"
          cy="220"
          r="75"
          fill={sets[2].color}
          stroke={sets[2].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Labels */}
        <text x="110" y="90" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[0].name}
        </text>
        <text x="270" y="90" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[1].name}
        </text>
        <text x="180" y="300" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[2].name}
        </text>
      </svg>
    )
  }

  const renderFourSets = () => {
    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        {/* Set A */}
        <circle
          cx="150"
          cy="150"
          r="70"
          fill={sets[0].color}
          stroke={sets[0].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set B */}
        <circle
          cx="250"
          cy="150"
          r="70"
          fill={sets[1].color}
          stroke={sets[1].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set C */}
        <circle
          cx="150"
          cy="250"
          r="70"
          fill={sets[2].color}
          stroke={sets[2].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Set D */}
        <circle
          cx="250"
          cy="250"
          r="70"
          fill={sets[3].color}
          stroke={sets[3].color.replace("0.5", "1")}
          strokeWidth="2"
        />
        {/* Labels */}
        <text x="120" y="100" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[0].name}
        </text>
        <text x="260" y="100" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[1].name}
        </text>
        <text x="120" y="330" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[2].name}
        </text>
        <text x="260" y="330" fontSize="16" fontWeight="bold" fill="currentColor">
          {sets[3].name}
        </text>
      </svg>
    )
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      {sets.length === 2 && renderTwoSets()}
      {sets.length === 3 && renderThreeSets()}
      {sets.length === 4 && renderFourSets()}
    </div>
  )
}