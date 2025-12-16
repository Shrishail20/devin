export const interpolateVariables = (
  text: string,
  data: Record<string, unknown>
): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match;
  });
};

export const extractVariables = (text: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
};

export const interpolateComponent = (
  component: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const interpolated = { ...component };
  
  if (typeof interpolated.props === 'object' && interpolated.props !== null) {
    const props = interpolated.props as Record<string, unknown>;
    const newProps: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        newProps[key] = interpolateVariables(value, data);
      } else {
        newProps[key] = value;
      }
    }
    
    interpolated.props = newProps;
  }
  
  return interpolated;
};
